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
exports.ProductInvestmentSchema = exports.ProductInvestment = exports.InvestmentAuditEntrySchema = exports.InvestmentAuditEntry = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let InvestmentAuditEntry = class InvestmentAuditEntry {
};
exports.InvestmentAuditEntry = InvestmentAuditEntry;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], InvestmentAuditEntry.prototype, "changedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: Date.now }),
    __metadata("design:type", Date)
], InvestmentAuditEntry.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], InvestmentAuditEntry.prototype, "fieldChanged", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], InvestmentAuditEntry.prototype, "previousValue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], InvestmentAuditEntry.prototype, "newValue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], InvestmentAuditEntry.prototype, "reason", void 0);
exports.InvestmentAuditEntry = InvestmentAuditEntry = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], InvestmentAuditEntry);
exports.InvestmentAuditEntrySchema = mongoose_1.SchemaFactory.createForClass(InvestmentAuditEntry);
let ProductInvestment = class ProductInvestment {
};
exports.ProductInvestment = ProductInvestment;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true }),
    __metadata("design:type", String)
], ProductInvestment.prototype, "investmentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: Date.now, index: true }),
    __metadata("design:type", Date)
], ProductInvestment.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Product', required: true, index: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], ProductInvestment.prototype, "productId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ProductInvestment.prototype, "productName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], ProductInvestment.prototype, "variantSku", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], ProductInvestment.prototype, "variantDetails", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1 }),
    __metadata("design:type", Number)
], ProductInvestment.prototype, "quantity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], ProductInvestment.prototype, "purchasePrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0, default: 0 }),
    __metadata("design:type", Number)
], ProductInvestment.prototype, "boxCost", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0, default: 0 }),
    __metadata("design:type", Number)
], ProductInvestment.prototype, "transportCost", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0, default: 0 }),
    __metadata("design:type", Number)
], ProductInvestment.prototype, "polyCost", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0, default: 0 }),
    __metadata("design:type", Number)
], ProductInvestment.prototype, "stickerCost", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0, default: 0 }),
    __metadata("design:type", Number)
], ProductInvestment.prototype, "tagCost", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0, default: 0 }),
    __metadata("design:type", Number)
], ProductInvestment.prototype, "otherCost", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], ProductInvestment.prototype, "additionalCostPerUnit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], ProductInvestment.prototype, "actualCostPerUnit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], ProductInvestment.prototype, "totalInvestment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 0 }),
    __metadata("design:type", Number)
], ProductInvestment.prototype, "remainingStock", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 'Bank' }),
    __metadata("design:type", String)
], ProductInvestment.prototype, "paymentAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], ProductInvestment.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'ADMIN' }),
    __metadata("design:type", String)
], ProductInvestment.prototype, "recordedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.InvestmentAuditEntrySchema], default: [] }),
    __metadata("design:type", Array)
], ProductInvestment.prototype, "auditHistory", void 0);
exports.ProductInvestment = ProductInvestment = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ProductInvestment);
exports.ProductInvestmentSchema = mongoose_1.SchemaFactory.createForClass(ProductInvestment);
exports.ProductInvestmentSchema.index({ date: -1 });
exports.ProductInvestmentSchema.index({ productId: 1, variantSku: 1 });
exports.ProductInvestmentSchema.index({ createdAt: -1 });
//# sourceMappingURL=product-investment.schema.js.map