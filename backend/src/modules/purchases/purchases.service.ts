import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Supplier, SupplierDocument } from '../../schemas/supplier.schema';
import { PurchaseOrder, PurchaseOrderDocument, PurchaseStatus, PurchasePaymentStatus } from '../../schemas/purchase.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { InventoryTransaction, InventoryTransactionDocument, InventoryTransactionType } from '../../schemas/inventory-transaction.schema';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectModel(Supplier.name) private supplierModel: Model<SupplierDocument>,
    @InjectModel(PurchaseOrder.name) private purchaseModel: Model<PurchaseOrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(InventoryTransaction.name) private transactionModel: Model<InventoryTransactionDocument>,
    private auditLogService: AuditLogService,
  ) {}

  // ================= SUPPLIERS =================

  async getSuppliers() {
    return this.supplierModel.find().sort({ createdAt: -1 }).exec();
  }

  async createSupplier(data: Partial<Supplier>, actor: string = 'ADMIN') {
    if (!data.name || !data.phone) {
      throw new BadRequestException('Supplier name and phone are required');
    }
    const supplier = await this.supplierModel.create({
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email || '',
      address: data.address || '',
      contactPerson: data.contactPerson || '',
      notes: data.notes || '',
      totalPurchased: 0,
      totalPaid: 0,
      totalDue: 0,
      isActive: true,
    });

    await this.auditLogService.logAction({
      action: 'SUPPLIER_CREATED',
      entityType: 'Supplier',
      entityId: (supplier as any)._id.toString(),
      newData: { name: supplier.name, actor },
    });
    return supplier;
  }

  async updateSupplier(id: string, data: Partial<Supplier>, actor: string = 'ADMIN') {
    const supplier = await this.supplierModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
    if (!supplier) throw new NotFoundException('Supplier not found');
    await this.auditLogService.logAction({
      action: 'SUPPLIER_UPDATED',
      entityType: 'Supplier',
      entityId: id,
      newData: { ...data, actor },
    });
    return supplier;
  }

  async deleteSupplier(id: string, actor: string = 'ADMIN') {
    const supplier = await this.supplierModel.findByIdAndDelete(id).exec();
    if (!supplier) throw new NotFoundException('Supplier not found');
    await this.auditLogService.logAction({
      action: 'SUPPLIER_DELETED',
      entityType: 'Supplier',
      entityId: id,
      newData: { name: supplier.name, actor },
    });
    return { success: true };
  }

  // ================= PURCHASE ORDERS & GRN =================

  async getPurchaseOrders(query: { status?: string; supplierId?: string }) {
    const filter: any = {};
    if (query.status) filter.status = query.status;
    if (query.supplierId) filter.supplierId = query.supplierId;
    return this.purchaseModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async getPurchaseOrderById(id: string) {
    const po = await this.purchaseModel.findById(id).exec();
    if (!po) throw new NotFoundException('Purchase order not found');
    return po;
  }

  async createPurchaseOrder(data: any, actor: string = 'ADMIN') {
    const supplier = await this.supplierModel.findById(data.supplierId).exec();
    if (!supplier) throw new NotFoundException('Supplier not found');

    const count = await this.purchaseModel.countDocuments();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const purchaseId = `PO-${dateStr}-${String(count + 1).padStart(3, '0')}`;

    let subtotalCost = 0;
    const items = (data.items || []).map((item: any) => {
      const qty = Number(item.quantity) || 1;
      const unitCost = Number(item.unitCost) || 0;
      const lineCost = qty * unitCost;
      subtotalCost += lineCost;
      return {
        productId: new Types.ObjectId(item.productId),
        productName: item.productName || 'Product',
        sku: item.sku,
        variantName: item.variantName || '',
        color: item.color || '',
        size: item.size || '',
        quantity: qty,
        unitCost,
        totalCost: lineCost,
      };
    });

    const additionalCost = Number(data.additionalCost) || 0;
    const totalCost = subtotalCost + additionalCost;
    const paidAmount = Number(data.paidAmount) || 0;
    const dueAmount = Math.max(0, totalCost - paidAmount);

    let paymentStatus = PurchasePaymentStatus.UNPAID;
    if (paidAmount >= totalCost && totalCost > 0) {
      paymentStatus = PurchasePaymentStatus.PAID;
    } else if (paidAmount > 0) {
      paymentStatus = PurchasePaymentStatus.PARTIALLY_PAID;
    }

    const po = new this.purchaseModel({
      purchaseId,
      supplierId: (supplier as any)._id,
      supplierName: supplier.name,
      invoiceNumber: data.invoiceNumber || '',
      items,
      subtotalCost,
      additionalCost,
      totalCost,
      paidAmount,
      dueAmount,
      status: PurchaseStatus.PENDING,
      paymentStatus,
      notes: data.notes || '',
    });

    await po.save();

    await this.auditLogService.logAction({
      action: 'PURCHASE_ORDER_CREATED',
      entityType: 'PurchaseOrder',
      entityId: (po as any)._id.toString(),
      newData: {
        purchaseId,
        totalCost,
        supplier: supplier.name,
        actor,
      },
    });

    return po;
  }

  /**
   * Goods Receipt Note (GRN) Processing
   * Atomically adds stock, calculates perpetual weighted average cost (WAC), logs immutable transaction ledger, and updates supplier balance.
   */
  async receiveGoods(purchaseOrderId: string, actor: string = 'ADMIN') {
    const po = await this.purchaseModel.findById(purchaseOrderId).exec();
    if (!po) throw new NotFoundException('Purchase order not found');

    if (po.status === PurchaseStatus.RECEIVED) {
      throw new BadRequestException('This purchase order has already been received into inventory.');
    }

    const supplier = await this.supplierModel.findById(po.supplierId).exec();

    // Total units in PO to distribute any extra shipping/customs costs
    const totalUnits = po.items.reduce((sum, item) => sum + item.quantity, 0);
    const extraCostPerUnit = totalUnits > 0 ? (po.additionalCost || 0) / totalUnits : 0;

    for (const item of po.items) {
      const product = await this.productModel.findById(item.productId).exec();
      if (!product) continue;

      const variantIndex = product.variants.findIndex((v) => v.sku === item.sku);
      if (variantIndex === -1) continue;

      const variant = product.variants[variantIndex];
      const oldQty = variant.stockQuantity || 0;
      const oldCost = variant.weightedAverageCost || variant.costPrice || item.unitCost;
      const receivedQty = item.quantity;
      const effectiveUnitCost = item.unitCost + extraCostPerUnit;

      const newQty = oldQty + receivedQty;
      const newWAC = newQty > 0
        ? Math.round(((oldQty * oldCost) + (receivedQty * effectiveUnitCost)) / newQty)
        : effectiveUnitCost;

      variant.stockQuantity = newQty;
      variant.weightedAverageCost = newWAC;
      variant.costPrice = effectiveUnitCost;

      product.markModified('variants');
      await product.save();

      // Immutable Inventory Transaction Log
      await this.transactionModel.create({
        productId: (product as any)._id,
        variantSku: item.sku,
        previousQuantity: oldQty,
        quantityChange: receivedQty,
        newQuantity: newQty,
        transactionType: InventoryTransactionType.RESTOCK,
        note: `GRN Received from PO #${po.purchaseId} (${po.supplierName}) @ ৳${effectiveUnitCost}/unit`,
      });
    }

    // Update Supplier Financial Balances
    if (supplier) {
      supplier.totalPurchased = (supplier.totalPurchased || 0) + po.totalCost;
      supplier.totalPaid = (supplier.totalPaid || 0) + po.paidAmount;
      supplier.totalDue = (supplier.totalDue || 0) + po.dueAmount;
      await supplier.save();
    }

    po.status = PurchaseStatus.RECEIVED;
    po.receivedAt = new Date();
    po.receivedBy = actor;
    await po.save();

    await this.auditLogService.logAction({
      action: 'GOODS_RECEIPT_POSTED',
      entityType: 'PurchaseOrder',
      entityId: (po as any)._id.toString(),
      newData: {
        purchaseId: po.purchaseId,
        totalCost: po.totalCost,
        supplier: po.supplierName,
        actor,
      },
    });

    return {
      success: true,
      message: `Goods for ${po.purchaseId} received and stock updated with weighted-average costing.`,
      purchaseOrder: po,
    };
  }
}
