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
var InventoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const inventory_transaction_schema_1 = require("../../schemas/inventory-transaction.schema");
const product_schema_1 = require("../../schemas/product.schema");
let InventoryService = InventoryService_1 = class InventoryService {
    transactionModel;
    productModel;
    logger = new common_1.Logger(InventoryService_1.name);
    constructor(transactionModel, productModel) {
        this.transactionModel = transactionModel;
        this.productModel = productModel;
    }
    async logLedgerEntry(params) {
        const actorObjId = params.actorId && mongoose_2.Types.ObjectId.isValid(params.actorId)
            ? new mongoose_2.Types.ObjectId(params.actorId)
            : undefined;
        return this.transactionModel.create({
            productId: new mongoose_2.Types.ObjectId(params.productId),
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
    async reserveStock(productId, variantSku, quantity, orderId) {
        if (quantity <= 0) {
            throw new common_1.BadRequestException('Reservation quantity must be greater than 0');
        }
        const product = await this.productModel.findById(productId).exec();
        if (!product)
            throw new common_1.NotFoundException(`Product not found`);
        const vIndex = product.variants.findIndex((v) => v.sku === variantSku);
        if (vIndex === -1)
            throw new common_1.NotFoundException(`Variant SKU "${variantSku}" not found on product`);
        const result = await this.productModel.collection.findOneAndUpdate({
            _id: new mongoose_2.Types.ObjectId(productId),
            'variants.sku': variantSku,
        }, [
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
        ], { returnDocument: 'after' });
        const doc = result?.value || result;
        const isSuccess = Boolean(doc?._lastReservationSuccess);
        if (!isSuccess) {
            throw new common_1.BadRequestException(`Insufficient available stock for "${product.name}". The item may have just been reserved by another customer.`);
        }
        const updatedVariant = doc?.variants?.find((v) => v.sku === variantSku);
        const availableStock = Math.max(0, (updatedVariant?.stockQuantity || 0) - (updatedVariant?.reservedQuantity || 0));
        await this.logLedgerEntry({
            productId,
            variantSku,
            previousQuantity: availableStock + quantity,
            quantityChange: -quantity,
            newQuantity: availableStock,
            transactionType: inventory_transaction_schema_1.InventoryTransactionType.RESERVE,
            orderId,
            note: `Stock reserved for order #${orderId}`,
        });
    }
    async releaseReservation(productId, variantSku, quantity, orderId) {
        const product = await this.productModel.findById(productId).exec();
        if (!product)
            return;
        const vIndex = product.variants.findIndex((v) => v.sku === variantSku);
        if (vIndex === -1)
            return;
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
            transactionType: inventory_transaction_schema_1.InventoryTransactionType.RELEASE_RESERVATION,
            orderId,
            note: `Reserved stock released due to order cancellation #${orderId}`,
        });
    }
    async fulfillStock(productId, variantSku, quantity, orderId) {
        const product = await this.productModel.findById(productId).exec();
        if (!product)
            return;
        const vIndex = product.variants.findIndex((v) => v.sku === variantSku);
        if (vIndex === -1)
            return;
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
            transactionType: inventory_transaction_schema_1.InventoryTransactionType.FULFILLMENT,
            orderId,
            note: `Physical inventory deducted on fulfillment #${orderId}`,
        });
    }
    async returnStock(productId, variantSku, quantity, orderId, actorId) {
        const product = await this.productModel.findById(productId).exec();
        if (!product)
            return;
        const vIndex = product.variants.findIndex((v) => v.sku === variantSku);
        if (vIndex === -1)
            return;
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
            transactionType: inventory_transaction_schema_1.InventoryTransactionType.RESTOCK,
            orderId,
            actorId,
            note: `Physical stock restored on return #${orderId}`,
        });
    }
    async adjustStock(productId, variantSku, quantityChange, actorId, note, transactionType = inventory_transaction_schema_1.InventoryTransactionType.MANUAL_ADJUSTMENT) {
        const product = await this.productModel.findById(productId).exec();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        const vIndex = product.variants.findIndex((v) => v.sku === variantSku);
        if (vIndex === -1)
            throw new common_1.NotFoundException(`Variant with SKU "${variantSku}" not found`);
        const currentStock = product.variants[vIndex].stockQuantity || 0;
        const newStock = currentStock + quantityChange;
        if (newStock < 0) {
            throw new common_1.BadRequestException(`Cannot adjust stock below 0. Current physical stock is ${currentStock}.`);
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
    async getTransactions(query) {
        const filter = {};
        if (query.productId && mongoose_2.Types.ObjectId.isValid(query.productId))
            filter.productId = new mongoose_2.Types.ObjectId(query.productId);
        if (query.type)
            filter.transactionType = query.type;
        const limit = Math.max(1, Math.min(200, Number(query.limit) || 100));
        return this.transactionModel
            .find(filter)
            .populate('productId', 'name slug images')
            .populate('actorId', 'name email role')
            .sort({ timestamp: -1 })
            .limit(limit)
            .exec();
    }
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
            lowStockVariants: 0,
            items: [],
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
                }
                else if (available <= safety) {
                    summary.lowStockVariants++;
                }
                summary.items.push({
                    productId: prod._id,
                    productName: prod.name,
                    productSlug: prod.slug,
                    productQrCode: prod.qr?.publicCode,
                    productImage: prod.images?.[0] || '',
                    category: prod.categoryId?.name || 'General',
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
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = InventoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(inventory_transaction_schema_1.InventoryTransaction.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map