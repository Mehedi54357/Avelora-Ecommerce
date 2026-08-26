"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const supplier_schema_1 = require("../../schemas/supplier.schema");
const purchase_schema_1 = require("../../schemas/purchase.schema");
const product_schema_1 = require("../../schemas/product.schema");
const inventory_transaction_schema_1 = require("../../schemas/inventory-transaction.schema");
const audit_log_service_1 = require("../audit-log/audit-log.service");
let PurchasesService = class PurchasesService {
    supplierModel;
    purchaseModel;
    productModel;
    transactionModel;
    auditLogService;
    constructor(supplierModel, purchaseModel, productModel, transactionModel, auditLogService) {
        this.supplierModel = supplierModel;
        this.purchaseModel = purchaseModel;
        this.productModel = productModel;
        this.transactionModel = transactionModel;
        this.auditLogService = auditLogService;
    }
    async getSuppliers() {
        return this.supplierModel.find().sort({ createdAt: -1 }).exec();
    }
    async createSupplier(data, actor = 'ADMIN') {
        if (!data.name || !data.phone) {
            throw new common_1.BadRequestException('Supplier name and phone are required');
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
            entityId: supplier._id.toString(),
            newData: { name: supplier.name, actor },
        });
        return supplier;
    }
    async updateSupplier(id, data, actor = 'ADMIN') {
        const supplier = await this.supplierModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
        if (!supplier)
            throw new common_1.NotFoundException('Supplier not found');
        await this.auditLogService.logAction({
            action: 'SUPPLIER_UPDATED',
            entityType: 'Supplier',
            entityId: id,
            newData: { ...data, actor },
        });
        return supplier;
    }
    async deleteSupplier(id, actor = 'ADMIN') {
        const supplier = await this.supplierModel.findByIdAndDelete(id).exec();
        if (!supplier)
            throw new common_1.NotFoundException('Supplier not found');
        await this.auditLogService.logAction({
            action: 'SUPPLIER_DELETED',
            entityType: 'Supplier',
            entityId: id,
            newData: { name: supplier.name, actor },
        });
        return { success: true };
    }
    async getPurchaseOrders(query) {
        const filter = {};
        if (query.status)
            filter.status = query.status;
        if (query.supplierId)
            filter.supplierId = query.supplierId;
        return this.purchaseModel.find(filter).sort({ createdAt: -1 }).exec();
    }
    async getPurchaseOrderById(id) {
        const po = await this.purchaseModel.findById(id).exec();
        if (!po)
            throw new common_1.NotFoundException('Purchase order not found');
        return po;
    }
    async createPurchaseOrder(data, actor = 'ADMIN') {
        const supplier = await this.supplierModel.findById(data.supplierId).exec();
        if (!supplier)
            throw new common_1.NotFoundException('Supplier not found');
        const count = await this.purchaseModel.countDocuments();
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const purchaseId = `PO-${dateStr}-${String(count + 1).padStart(3, '0')}`;
        let subtotalCost = 0;
        const items = (data.items || []).map((item) => {
            const qty = Number(item.quantity) || 1;
            const unitCost = Number(item.unitCost) || 0;
            const lineCost = qty * unitCost;
            subtotalCost += lineCost;
            return {
                productId: new mongoose_2.Types.ObjectId(item.productId),
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
        let paymentStatus = purchase_schema_1.PurchasePaymentStatus.UNPAID;
        if (paidAmount >= totalCost && totalCost > 0) {
            paymentStatus = purchase_schema_1.PurchasePaymentStatus.PAID;
        }
        else if (paidAmount > 0) {
            paymentStatus = purchase_schema_1.PurchasePaymentStatus.PARTIALLY_PAID;
        }
        const po = new this.purchaseModel({
            purchaseId,
            supplierId: supplier._id,
            supplierName: supplier.name,
            invoiceNumber: data.invoiceNumber || '',
            items,
            subtotalCost,
            additionalCost,
            totalCost,
            paidAmount,
            dueAmount,
            status: purchase_schema_1.PurchaseStatus.PENDING,
            paymentStatus,
            notes: data.notes || '',
        });
        await po.save();
        await this.auditLogService.logAction({
            action: 'PURCHASE_ORDER_CREATED',
            entityType: 'PurchaseOrder',
            entityId: po._id.toString(),
            newData: {
                purchaseId,
                totalCost,
                supplier: supplier.name,
                actor,
            },
        });
        return po;
    }
    async receiveGoods(purchaseOrderId, actor = 'ADMIN') {
        const po = await this.purchaseModel.findById(purchaseOrderId).exec();
        if (!po)
            throw new common_1.NotFoundException('Purchase order not found');
        if (po.status === purchase_schema_1.PurchaseStatus.RECEIVED) {
            throw new common_1.BadRequestException('This purchase order has already been received into inventory.');
        }
        const supplier = await this.supplierModel.findById(po.supplierId).exec();
        const totalUnits = po.items.reduce((sum, item) => sum + item.quantity, 0);
        const extraCostPerUnit = totalUnits > 0 ? (po.additionalCost || 0) / totalUnits : 0;
        for (const item of po.items) {
            const product = await this.productModel.findById(item.productId).exec();
            if (!product)
                continue;
            const variantIndex = product.variants.findIndex((v) => v.sku === item.sku);
            if (variantIndex === -1)
                continue;
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
            await this.transactionModel.create({
                productId: product._id,
                variantSku: item.sku,
                previousQuantity: oldQty,
                quantityChange: receivedQty,
                newQuantity: newQty,
                transactionType: inventory_transaction_schema_1.InventoryTransactionType.RESTOCK,
                note: `GRN Received from PO #${po.purchaseId} (${po.supplierName}) @ ৳${effectiveUnitCost}/unit`,
            });
        }
        if (supplier) {
            supplier.totalPurchased = (supplier.totalPurchased || 0) + po.totalCost;
            supplier.totalPaid = (supplier.totalPaid || 0) + po.paidAmount;
            supplier.totalDue = (supplier.totalDue || 0) + po.dueAmount;
            await supplier.save();
        }
        po.status = purchase_schema_1.PurchaseStatus.RECEIVED;
        po.receivedAt = new Date();
        po.receivedBy = actor;
        await po.save();
        await this.auditLogService.logAction({
            action: 'GOODS_RECEIPT_POSTED',
            entityType: 'PurchaseOrder',
            entityId: po._id.toString(),
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
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(supplier_schema_1.Supplier.name)),
    __param(1, (0, mongoose_1.InjectModel)(purchase_schema_1.PurchaseOrder.name)),
    __param(2, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(3, (0, mongoose_1.InjectModel)(inventory_transaction_schema_1.InventoryTransaction.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        audit_log_service_1.AuditLogService])
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map