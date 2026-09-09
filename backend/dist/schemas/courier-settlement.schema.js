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
exports.CourierSettlementSchema = exports.CourierSettlement = exports.SettlementLineSchema = exports.SettlementLine = exports.SettlementStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var SettlementStatus;
(function (SettlementStatus) {
    SettlementStatus["MATCHED"] = "MATCHED";
    SettlementStatus["AMOUNT_MISMATCH"] = "AMOUNT_MISMATCH";
    SettlementStatus["MISSING_ORDER"] = "MISSING_ORDER";
    SettlementStatus["PENDING"] = "PENDING";
})(SettlementStatus || (exports.SettlementStatus = SettlementStatus = {}));
let SettlementLine = class SettlementLine {
};
exports.SettlementLine = SettlementLine;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Order', required: false }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], SettlementLine.prototype, "orderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SettlementLine.prototype, "orderNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SettlementLine.prototype, "consignmentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], SettlementLine.prototype, "codCollected", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], SettlementLine.prototype, "deliveryFee", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 0 }),
    __metadata("design:type", Number)
], SettlementLine.prototype, "returnFee", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 0 }),
    __metadata("design:type", Number)
], SettlementLine.prototype, "adjustmentFee", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], SettlementLine.prototype, "netRemitted", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: Object.values(SettlementStatus),
        default: SettlementStatus.MATCHED,
    }),
    __metadata("design:type", String)
], SettlementLine.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], SettlementLine.prototype, "discrepancyNote", void 0);
exports.SettlementLine = SettlementLine = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], SettlementLine);
exports.SettlementLineSchema = mongoose_1.SchemaFactory.createForClass(SettlementLine);
let CourierSettlement = class CourierSettlement {
};
exports.CourierSettlement = CourierSettlement;
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'Pathao' }),
    __metadata("design:type", String)
], CourierSettlement.prototype, "provider", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true }),
    __metadata("design:type", String)
], CourierSettlement.prototype, "settlementBatchId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.SettlementLineSchema], default: [] }),
    __metadata("design:type", Array)
], CourierSettlement.prototype, "lines", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], CourierSettlement.prototype, "totalCodCollected", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], CourierSettlement.prototype, "totalFeesDeducted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], CourierSettlement.prototype, "totalNetRemitted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: Date.now }),
    __metadata("design:type", Date)
], CourierSettlement.prototype, "settledAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 'MATCHED' }),
    __metadata("design:type", String)
], CourierSettlement.prototype, "overallStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], CourierSettlement.prototype, "bankDepositReference", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], CourierSettlement.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 'ADMIN' }),
    __metadata("design:type", String)
], CourierSettlement.prototype, "reconciledBy", void 0);
exports.CourierSettlement = CourierSettlement = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], CourierSettlement);
exports.CourierSettlementSchema = mongoose_1.SchemaFactory.createForClass(CourierSettlement);
exports.CourierSettlementSchema.index({ provider: 1, settledAt: -1 });
//# sourceMappingURL=courier-settlement.schema.js.map