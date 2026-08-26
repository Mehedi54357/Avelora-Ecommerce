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
exports.ReturnRequestSchema = exports.ReturnRequest = exports.ReturnStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var ReturnStatus;
(function (ReturnStatus) {
    ReturnStatus["PENDING_REVIEW"] = "PENDING_REVIEW";
    ReturnStatus["APPROVED"] = "APPROVED";
    ReturnStatus["REJECTED"] = "REJECTED";
    ReturnStatus["ITEM_RECEIVED"] = "ITEM_RECEIVED";
    ReturnStatus["INSPECTED_RESTOCKED"] = "INSPECTED_RESTOCKED";
    ReturnStatus["INSPECTED_DAMAGED"] = "INSPECTED_DAMAGED";
    ReturnStatus["REFUNDED"] = "REFUNDED";
})(ReturnStatus || (exports.ReturnStatus = ReturnStatus = {}));
let ReturnRequest = class ReturnRequest {
    orderId;
    orderReferenceId;
    customerId;
    items;
    reason;
    status;
    refundAmount;
    refundMethod;
    refundTransactionId;
    inspectedBy;
    inspectionNotes;
    receivedAt;
    refundedAt;
};
exports.ReturnRequest = ReturnRequest;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Order', required: true, index: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], ReturnRequest.prototype, "orderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ReturnRequest.prototype, "orderReferenceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Customer', required: false }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], ReturnRequest.prototype, "customerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                productId: { type: mongoose_2.Schema.Types.ObjectId, ref: 'Product' },
                sku: String,
                variant: String,
                quantity: Number,
                unitPrice: Number,
                restockable: Boolean,
            },
        ],
        required: true,
    }),
    __metadata("design:type", Array)
], ReturnRequest.prototype, "items", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ReturnRequest.prototype, "reason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: ReturnStatus.PENDING_REVIEW, enum: Object.values(ReturnStatus) }),
    __metadata("design:type", String)
], ReturnRequest.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], ReturnRequest.prototype, "refundAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'bKash' }),
    __metadata("design:type", String)
], ReturnRequest.prototype, "refundMethod", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], ReturnRequest.prototype, "refundTransactionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: false }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], ReturnRequest.prototype, "inspectedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], ReturnRequest.prototype, "inspectionNotes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Date)
], ReturnRequest.prototype, "receivedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Date)
], ReturnRequest.prototype, "refundedAt", void 0);
exports.ReturnRequest = ReturnRequest = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ReturnRequest);
exports.ReturnRequestSchema = mongoose_1.SchemaFactory.createForClass(ReturnRequest);
//# sourceMappingURL=return-request.schema.js.map