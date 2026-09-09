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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryTransactionSchema = exports.InventoryTransaction = exports.InventoryTransactionType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var InventoryTransactionType;
(function (InventoryTransactionType) {
    InventoryTransactionType["RESERVE"] = "RESERVE";
    InventoryTransactionType["RELEASE_RESERVATION"] = "RELEASE_RESERVATION";
    InventoryTransactionType["FULFILLMENT"] = "FULFILLMENT";
    InventoryTransactionType["RESTOCK"] = "RESTOCK";
    InventoryTransactionType["RETURN"] = "RETURN";
    InventoryTransactionType["MANUAL_ADJUSTMENT"] = "MANUAL_ADJUSTMENT";
    InventoryTransactionType["DAMAGE"] = "DAMAGE";
    InventoryTransactionType["QR_STOCK_IN"] = "QR_STOCK_IN";
    InventoryTransactionType["QR_STOCK_OUT"] = "QR_STOCK_OUT";
})(InventoryTransactionType || (exports.InventoryTransactionType = InventoryTransactionType = {}));
let InventoryTransaction = class InventoryTransaction {
};
exports.InventoryTransaction = InventoryTransaction;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Product', required: true, index: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], InventoryTransaction.prototype, "productId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], InventoryTransaction.prototype, "variantSku", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 0 }),
    __metadata("design:type", Number)
], InventoryTransaction.prototype, "previousQuantity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], InventoryTransaction.prototype, "quantityChange", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 0 }),
    __metadata("design:type", Number)
], InventoryTransaction.prototype, "newQuantity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: InventoryTransactionType, index: true }),
    __metadata("design:type", String)
], InventoryTransaction.prototype, "transactionType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], InventoryTransaction.prototype, "orderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: false }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], InventoryTransaction.prototype, "actorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], InventoryTransaction.prototype, "note", void 0);
exports.InventoryTransaction = InventoryTransaction = __decorate([
    (0, mongoose_1.Schema)({ timestamps: { createdAt: 'timestamp', updatedAt: false } })
], InventoryTransaction);
exports.InventoryTransactionSchema = mongoose_1.SchemaFactory.createForClass(InventoryTransaction);
exports.InventoryTransactionSchema.index({ timestamp: -1 });
exports.InventoryTransactionSchema.index({ productId: 1, variantSku: 1, timestamp: -1 });
//# sourceMappingURL=inventory-transaction.schema.js.map