import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  InventoryTransaction,
  InventoryTransactionDocument,
  InventoryTransactionType,
} from '../../schemas/inventory-transaction.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(InventoryTransaction.name)
    private transactionModel: Model<InventoryTransactionDocument>,
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
  ) {}

  async logTransaction(
    productId: string,
    variantSku: string,
    quantityChange: number,
    transactionType: InventoryTransactionType,
    orderId?: string,
    note?: string,
  ): Promise<InventoryTransaction> {
    return this.transactionModel.create({
      productId: new Types.ObjectId(productId) as any,
      variantSku,
      quantityChange,
      transactionType,
      orderId,
      note,
    });
  }

  // 1. Order Created -> Atomically Reserve Stock (stockQuantity untouched, reservedQuantity increases)
  async reserveStock(productId: string, variantSku: string, quantity: number, orderId: string) {
    const product = await this.productModel.findById(productId).exec();
    if (!product) throw new NotFoundException('Product not found');

    const vIndex = product.variants.findIndex((v) => v.sku === variantSku);
    if (vIndex === -1) throw new NotFoundException(`Variant SKU "${variantSku}" not found`);

    const variant = product.variants[vIndex];
    const available = (variant.stockQuantity || 0) - (variant.reservedQuantity || 0);

    if (available < quantity) {
      throw new BadRequestException(
        `Insufficient available stock for "${product.name} (${variant.color || ''} ${variant.size || ''})". Available: ${available}, Requested: ${quantity}`,
      );
    }

    product.variants[vIndex].reservedQuantity = (variant.reservedQuantity || 0) + quantity;
    product.markModified('variants');
    await product.save();

    await this.logTransaction(
      productId,
      variantSku,
      -quantity,
      InventoryTransactionType.RESERVE,
      orderId,
      `Stock reserved for order #${orderId}`,
    );
  }

  // 2. Order Cancelled (Before Delivery) -> Release Reserved Stock
  async releaseReservation(productId: string, variantSku: string, quantity: number, orderId: string) {
    const product = await this.productModel.findById(productId).exec();
    if (!product) return;

    const vIndex = product.variants.findIndex((v) => v.sku === variantSku);
    if (vIndex === -1) return;

    const currentReserved = product.variants[vIndex].reservedQuantity || 0;
    product.variants[vIndex].reservedQuantity = Math.max(0, currentReserved - quantity);
    product.markModified('variants');
    await product.save();

    await this.logTransaction(
      productId,
      variantSku,
      quantity,
      InventoryTransactionType.RELEASE_RESERVATION,
      orderId,
      `Reserved stock released due to order cancellation #${orderId}`,
    );
  }

  // 3. Order Fulfilled / Delivered -> Deduct Physical stock AND release reservation (No double deduction)
  async fulfillStock(productId: string, variantSku: string, quantity: number, orderId: string) {
    const product = await this.productModel.findById(productId).exec();
    if (!product) return;

    const vIndex = product.variants.findIndex((v) => v.sku === variantSku);
    if (vIndex === -1) return;

    const currentStock = product.variants[vIndex].stockQuantity || 0;
    const currentReserved = product.variants[vIndex].reservedQuantity || 0;

    product.variants[vIndex].stockQuantity = Math.max(0, currentStock - quantity);
    product.variants[vIndex].reservedQuantity = Math.max(0, currentReserved - quantity);
    product.markModified('variants');
    await product.save();

    await this.logTransaction(
      productId,
      variantSku,
      -quantity,
      InventoryTransactionType.FULFILLMENT,
      orderId,
      `Order fulfilled and physical inventory deducted #${orderId}`,
    );
  }

  // 4. Order Returned (After Delivery) -> Restore Physical Stock
  async returnStock(productId: string, variantSku: string, quantity: number, orderId: string) {
    const product = await this.productModel.findById(productId).exec();
    if (!product) return;

    const vIndex = product.variants.findIndex((v) => v.sku === variantSku);
    if (vIndex === -1) return;

    product.variants[vIndex].stockQuantity = (product.variants[vIndex].stockQuantity || 0) + quantity;
    product.markModified('variants');
    await product.save();

    await this.logTransaction(
      productId,
      variantSku,
      quantity,
      InventoryTransactionType.RETURN,
      orderId,
      `Physical stock returned and restored #${orderId}`,
    );
  }

  // Manual stock adjustment / restock
  async adjustStock(
    productId: string,
    variantSku: string,
    quantityChange: number,
    note?: string,
  ) {
    const product = await this.productModel.findById(productId).exec();
    if (!product) throw new NotFoundException('Product not found');

    const vIndex = product.variants.findIndex((v) => v.sku === variantSku);
    if (vIndex === -1) throw new NotFoundException(`Variant with SKU "${variantSku}" not found`);

    const currentStock = product.variants[vIndex].stockQuantity || 0;
    const newStock = currentStock + quantityChange;

    if (newStock < 0) {
      throw new BadRequestException(`Cannot adjust stock below 0. Current physical stock is ${currentStock}.`);
    }

    product.variants[vIndex].stockQuantity = newStock;
    product.markModified('variants');
    await product.save();

    const type = quantityChange > 0 ? InventoryTransactionType.RESTOCK : InventoryTransactionType.MANUAL_ADJUSTMENT;
    await this.logTransaction(productId, variantSku, quantityChange, type, undefined, note || 'Manual stock adjustment');

    return {
      success: true,
      productId,
      variantSku,
      previousStock: currentStock,
      newStock,
      availableStock: newStock - (product.variants[vIndex].reservedQuantity || 0),
    };
  }

  async getTransactions(query: { productId?: string; type?: string; limit?: number }) {
    const filter: any = {};
    if (query.productId) filter.productId = new Types.ObjectId(query.productId);
    if (query.type) filter.transactionType = query.type;

    const limit = Math.max(1, Math.min(200, Number(query.limit) || 100));

    return this.transactionModel
      .find(filter)
      .populate('productId', 'name slug images')
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async getInventoryStatus() {
    const products = await this.productModel
      .find()
      .select('name slug images variants categoryId isPublished')
      .populate('categoryId', 'name')
      .exec();

    const summary = {
      totalProducts: products.length,
      totalVariants: 0,
      totalStockUnits: 0,
      totalReservedUnits: 0,
      totalAvailableUnits: 0,
      outOfStockVariants: 0,
      lowStockVariants: 0, // available <= 5
      items: [] as any[],
    };

    for (const prod of products) {
      for (const variant of prod.variants) {
        summary.totalVariants++;
        const stockQty = variant.stockQuantity || 0;
        const reservedQty = variant.reservedQuantity || 0;
        const available = Math.max(0, stockQty - reservedQty);

        summary.totalStockUnits += stockQty;
        summary.totalReservedUnits += reservedQty;
        summary.totalAvailableUnits += available;

        if (available === 0) {
          summary.outOfStockVariants++;
        } else if (available <= 5) {
          summary.lowStockVariants++;
        }

        summary.items.push({
          productId: prod._id,
          productName: prod.name,
          productSlug: prod.slug,
          productImage: prod.images?.[0] || '',
          category: (prod.categoryId as any)?.name || 'General',
          sku: variant.sku,
          color: variant.color,
          size: variant.size,
          price: variant.price,
          costPrice: variant.costPrice,
          stockQuantity: stockQty,
          reservedQuantity: reservedQty,
          availableStock: available,
          status: available === 0 ? 'OUT_OF_STOCK' : available <= 5 ? 'LOW_STOCK' : 'IN_STOCK',
        });
      }
    }

    return summary;
  }
}
