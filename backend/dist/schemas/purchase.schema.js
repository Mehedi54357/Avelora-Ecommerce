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
exports.PurchaseOrderSchema = exports.PurchaseOrder = exports.PurchaseItemSchema = exports.PurchaseItem = exports.PurchasePaymentStatus = exports.PurchaseStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var PurchaseStatus;
(function (PurchaseStatus) {
    PurchaseStatus["DRAFT"] = "DRAFT";
    PurchaseStatus["PENDING"] = "PENDING";
    PurchaseStatus["RECEIVED"] = "RECEIVED";
    PurchaseStatus["PARTIAL"] = "PARTIAL";
    PurchaseStatus["CANCELLED"] = "CANCELLED";
})(PurchaseStatus || (exports.PurchaseStatus = PurchaseStatus = {}));
var PurchasePaymentStatus;
(function (PurchasePaymentStatus) {
    PurchasePaymentStatus["UNPAID"] = "UNPAID";
    PurchasePaymentStatus["PARTIALLY_PAID"] = "PARTIALLY_PAID";
    PurchasePaymentStatus["PAID"] = "PAID";
})(PurchasePaymentStatus || (exports.PurchasePaymentStatus = PurchasePaymentStatus = {}));
let PurchaseItem = class PurchaseItem {
    productId;
    productName;
    sku;
    variantName;
    color;
    size;
    quantity;
    unitCost;
    totalCost;
};
exports.PurchaseItem = PurchaseItem;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Product', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PurchaseItem.prototype, "productId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PurchaseItem.prototype, "productName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PurchaseItem.prototype, "sku", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], PurchaseItem.prototype, "variantName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], PurchaseItem.prototype, "color", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], PurchaseItem.prototype, "size", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1 }),
    __metadata("design:type", Number)
], PurchaseItem.prototype, "quantity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], PurchaseItem.prototype, "unitCost", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], PurchaseItem.prototype, "totalCost", void 0);
exports.PurchaseItem = PurchaseItem = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], PurchaseItem);
exports.PurchaseItemSchema = mongoose_1.SchemaFactory.createForClass(PurchaseItem);
let PurchaseOrder = class PurchaseOrder {
    purchaseId;
    supplierId;
    supplierName;
    invoiceNumber;
    items;
    subtotalCost;
    additionalCost;
    totalCost;
    paidAmount;
    dueAmount;
    status;
    paymentStatus;
    receivedAt;
    receivedBy;
    notes;
};
exports.PurchaseOrder = PurchaseOrder;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "purchaseId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Supplier', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PurchaseOrder.prototype, "supplierId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "supplierName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "invoiceNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.PurchaseItemSchema], required: true, default: [] }),
    __metadata("design:type", Array)
], PurchaseOrder.prototype, "items", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrder.prototype, "subtotalCost", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrder.prototype, "additionalCost", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrder.prototype, "totalCost", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrder.prototype, "paidAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrder.prototype, "dueAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: Object.values(PurchaseStatus),
        default: PurchaseStatus.PENDING,
    }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: Object.values(PurchasePaymentStatus),
        default: PurchasePaymentStatus.UNPAID,
    }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "paymentStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Date)
], PurchaseOrder.prototype, "receivedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "receivedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "notes", void 0);
exports.PurchaseOrder = PurchaseOrder = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PurchaseOrder);
exports.PurchaseOrderSchema = mongoose_1.SchemaFactory.createForClass(PurchaseOrder);
exports.PurchaseOrderSchema.index({ status: 1, createdAt: -1 });
exports.PurchaseOrderSchema.index({ supplierId: 1, createdAt: -1 });
//# sourceMappingURL=purchase.schema.js.map