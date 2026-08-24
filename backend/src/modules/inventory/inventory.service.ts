import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectModel(InventoryTransaction.name)
    private transactionModel: Model<InventoryTransactionDocument>,
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
  ) {}

  // Immutable Ledger Logger
  async logLedgerEntry(params: {
    productId: string;
    variantSku: string;
    previousQuantity: number;
    quantityChange: number;
    newQuantity: number;
    transactionType: InventoryTransactionType;
    orderId?: string;
    actorId?: string;
    note?: string;
  }): Promise<InventoryTransaction> {
    const actorObjId =
      params.actorId && Types.ObjectId.isValid(params.actorId)
        ? (new Types.ObjectId(params.actorId) as any)
        : undefined;

    return this.transactionModel.create({
      productId: new Types.ObjectId(params.productId) as any,
      variantSku: params.variantSku,
      previousQuantity: params.previousQuantity,
      quantityChange: params.quantityChange,
      newQuantity: params.newQuantity,
      transactionType: params.transactionType,
      orderId: params.orderId,
      actorId: actorObjId,
      note: params.note || '',
    });
  }

  // 1. Order Checkout -> Atomically Reserve Stock (Preventing race conditions & overselling on last item)
  async reserveStock(productId: string, variantSku: string, quantity: number, orderId: string): Promise<void> {
    if (quantity <= 0) {
      throw new BadRequestException('Reservation quantity must be greater than 0');
    }

    const product = await this.productModel.findById(productId).exec();
    if (!product) throw new NotFoundException(`Product not found`);

    const vIndex = product.variants.findIndex((v) => v.sku === variantSku);
    if (vIndex === -1) throw new NotFoundException(`Variant SKU "${variantSku}" not found on product`);

    // Native atomic conditional pipeline update:
    // Only increments reservedQuantity if (stockQuantity - reservedQuantity >= quantity)
    const result: any = await this.productModel.collection.findOneAndUpdate(
      {
        _id: new Types.ObjectId(productId),
        'variants.sku': variantSku,
      },
      [
        {
          $set: {
            _lastReservationSuccess: {
              $let: {
                vars: {
                  matchedVariant: {
                    $first: {
                      $filter: {
                        input: '$variants',
                        as: 'v',
                        cond: { $eq: ['$$v.sku', variantSku] },
                      },
                    },
                  },
                },
                in: {
                  $gte: [
                    {
                      $subtract: [
                        { $ifNull: ['$$matchedVariant.stockQuantity', 0] },
                        { $ifNull: ['$$matchedVariant.reservedQuantity', 0] },
                      ],
                    },
                    quantity,
                  ],
                },
              },
            },
            variants: {
              $map: {
                input: '$variants',
                as: 'v',
                in: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ['$$v.sku', variantSku] },
                        {
                          $gte: [
                            { $subtract: [{ $ifNull: ['$$v.stockQuantity', 0] }, { $ifNull: ['$$v.reservedQuantity', 0] }] },
                            quantity,
                          ],
                        },
                      ],
                    },
                    {
                      $mergeObjects: [
                        '$$v',
                        {
                          reservedQuantity: { $add: [{ $ifNull: ['$$v.reservedQuantity', 0] }, quantity] },
                        },
                      ],
                    },
                    '$$v',
                  ],
                },
              },
            },
          },
        },
      ],
      { returnDocument: 'after' },
    );

    const doc = result?.value || result;
    const isSuccess = Boolean(doc?._lastReservationSuccess);

    if (!isSuccess) {
      throw new BadRequestException(
        `Insufficient available stock for "${product.name}". The item may have just been reserved by another customer.`,
      );
    }

    const updatedVariant = doc?.variants?.find((v: any) => v.sku === variantSku);
    const availableStock = Math.max(0, (updatedVariant?.stockQuantity || 0) - (updatedVariant?.reservedQuantity || 0));

    await this.logLedgerEntry({
      productId,
      variantSku,
      previousQuantity: availableStock + quantity,
      quantityChange: -quantity,
      newQuantity: availableStock,
      transactionType: InventoryTransactionType.RESERVE,
      orderId,
      note: `Stock reserved for order #${orderId}`,
    });
  }

  // 2. Order Cancelled (Before Delivery) -> Release Reserved Stock back to shelf
  async releaseReservation(productId: string, variantSku: string, quantity: number, orderId: string): Promise<void> {
    const product = await this.productModel.findById(productId).exec();
    if (!product) return;

    const vIndex = product.variants.findIndex((v) => v.sku === variantSku);
    if (vIndex === -1) return;

    const currentReserved = product.variants[vIndex].reservedQuantity || 0;
    const releaseQty = Math.min(currentReserved, quantity);
    const newReserved = Math.max(0, currentReserved - releaseQty);

    product.variants[vIndex].reservedQuantity = newReserved;
    product.markModified('variants');
    await product.save();

    const currentStock = product.variants[vIndex].stockQuantity || 0;
    const availableAfter = currentStock - newReserved;

    await this.logLedgerEntry({
      productId,
      variantSku,
      previousQuantity: currentStock - currentReserved,
      quantityChange: releaseQty,
      newQuantity: availableAfter,
      transactionType: InventoryTransactionType.RELEASE_RESERVATION,
      orderId,
      note: `Reserved stock released due to order cancellation #${orderId}`,
    });
  }

  // 3. Order Delivered / Fulfilled -> Deduct Physical stock AND release reservation (Zero double deduction)
  async fulfillStock(productId: string, variantSku: string, quantity: number, orderId: string): Promise<void> {
    const product = await this.productModel.findById(productId).exec();
    if (!product) return;

    const vIndex = product.variants.findIndex((v) => v.sku === variantSku);
    if (vIndex === -1) return;

    const currentStock = product.variants[vIndex].stockQuantity || 0;
    const currentReserved = product.variants[vIndex].reservedQuantity || 0;

    const newStock = Math.max(0, currentStock - quantity);
    const newReserved = Math.max(0, currentReserved - quantity);

    product.variants[vIndex].stockQuantity = newStock;
    product.variants[vIndex].reservedQuantity = newReserved;
    product.markModified('variants');
    await product.save();

    await this.logLedgerEntry({
      productId,
      variantSku,
      previousQuantity: currentStock,
      quantityChange: -quantity,
      newQuantity: newStock,
      transactionType: InventoryTransactionType.FULFILLMENT,
      orderId,
      note: `Physical inventory deducted on fulfillment #${orderId}`,
    });
  }

  // 4. Order Returned (After Delivery) -> Restock Physical Inventory on Hand
  async returnStock(productId: string, variantSku: string, quantity: number, orderId: string, actorId?: string): Promise<void> {
    const product = await this.productModel.findById(productId).exec();
    if (!product) return;

    const vIndex = product.variants.findIndex((v) => v.sku === variantSku);
    if (vIndex === -1) return;

    const currentStock = product.variants[vIndex].stockQuantity || 0;
    const newStock = currentStock + quantity;

    product.variants[vIndex].stockQuantity = newStock;
    product.markModified('variants');
    await product.save();

    await this.logLedgerEntry({
      productId,
      variantSku,
      previousQuantity: currentStock,
      quantityChange: quantity,
      newQuantity: newStock,
      transactionType: InventoryTransactionType.RESTOCK,
      orderId,
      actorId,
      note: `Physical stock restored on return #${orderId}`,
    });
  }

  // 5. Manual Stock Adjustment (Admin / Warehouse QR scan)
  async adjustStock(
    productId: string,
    variantSku: string,
    quantityChange: number,
    actorId?: string,
    note?: string,
    transactionType = InventoryTransactionType.MANUAL_ADJUSTMENT,
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

    const currentReserved = product.variants[vIndex].reservedQuantity || 0;

    await this.logLedgerEntry({
      productId,
      variantSku,
      previousQuantity: currentStock,
      quantityChange,
      newQuantity: newStock,
      transactionType,
      actorId,
      note: note || 'Manual stock adjustment',
    });

    return {
      success: true,
      productId,
      variantSku,
      previousStock: currentStock,
      newStock,
      availableStock: Math.max(0, newStock - currentReserved),
    };
  }

  // 6. Get Immutable Audit Ledger Transactions
  async getTransactions(query: { productId?: string; type?: string; limit?: number }) {
    const filter: any = {};
    if (query.productId && Types.ObjectId.isValid(query.productId)) filter.productId = new Types.ObjectId(query.productId);
    if (query.type) filter.transactionType = query.type;

    const limit = Math.max(1, Math.min(200, Number(query.limit) || 100));

    return this.transactionModel
      .find(filter)
      .populate('productId', 'name slug images')
      .populate('actorId', 'name email role')
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  // 7. Inventory Status Overview & Low Stock Warnings
  async getInventoryStatus() {
    const products = await this.productModel
      .find()
      .select('name slug images variants categoryId isPublished status qr')
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
        const safety = variant.safetyStock || 5;

        summary.totalStockUnits += stockQty;
        summary.totalReservedUnits += reservedQty;
        summary.totalAvailableUnits += available;

        if (available === 0) {
          summary.outOfStockVariants++;
        } else if (available <= safety) {
          summary.lowStockVariants++;
        }

        summary.items.push({
          productId: prod._id,
          productName: prod.name,
          productSlug: prod.slug,
          productQrCode: prod.qr?.publicCode,
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
          safetyStock: safety,
          status: available === 0 ? 'OUT_OF_STOCK' : available <= safety ? 'LOW_STOCK' : 'IN_STOCK',
        });
      }
    }

    return summary;
  }
}
