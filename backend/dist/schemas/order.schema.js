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
exports.OrderSchema = exports.Order = exports.OrderTimelineEntrySchema = exports.OrderTimelineEntry = exports.CustomerDetailsSnapshotSchema = exports.CustomerDetailsSnapshot = exports.OrderItemSchema = exports.OrderItem = exports.FulfillmentStatus = exports.CourierSettlementStatus = exports.PaymentStatus = exports.OrderStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["PROCESSING"] = "PROCESSING";
    OrderStatus["PACKED"] = "PACKED";
    OrderStatus["COURIER_BOOKED"] = "COURIER_BOOKED";
    OrderStatus["SHIPPED"] = "SHIPPED";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["RETURN_REQUESTED"] = "RETURN_REQUESTED";
    OrderStatus["RETURNED"] = "RETURNED";
    OrderStatus["REFUNDED"] = "REFUNDED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["UNPAID"] = "UNPAID";
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PARTIALLY_PAID"] = "PARTIALLY_PAID";
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["PARTIALLY_REFUNDED"] = "PARTIALLY_REFUNDED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["CANCELLED"] = "CANCELLED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var CourierSettlementStatus;
(function (CourierSettlementStatus) {
    CourierSettlementStatus["NOT_APPLICABLE"] = "NOT_APPLICABLE";
    CourierSettlementStatus["AWAITING_SETTLEMENT"] = "AWAITING_SETTLEMENT";
    CourierSettlementStatus["PARTIALLY_SETTLED"] = "PARTIALLY_SETTLED";
    CourierSettlementStatus["SETTLED"] = "SETTLED";
    CourierSettlementStatus["DISPUTED"] = "DISPUTED";
})(CourierSettlementStatus || (exports.CourierSettlementStatus = CourierSettlementStatus = {}));
var FulfillmentStatus;
(function (FulfillmentStatus) {
    FulfillmentStatus["UNFULFILLED"] = "UNFULFILLED";
    FulfillmentStatus["PROCESSING"] = "PROCESSING";
    FulfillmentStatus["PACKED"] = "PACKED";
    FulfillmentStatus["COURIER_BOOKED"] = "COURIER_BOOKED";
    FulfillmentStatus["SHIPPED"] = "SHIPPED";
    FulfillmentStatus["DELIVERED"] = "DELIVERED";
    FulfillmentStatus["RETURNED"] = "RETURNED";
})(FulfillmentStatus || (exports.FulfillmentStatus = FulfillmentStatus = {}));
let OrderItem = class OrderItem {
};
exports.OrderItem = OrderItem;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Product', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], OrderItem.prototype, "productId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], OrderItem.prototype, "productName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], OrderItem.prototype, "productImage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], OrderItem.prototype, "sku", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], OrderItem.prototype, "variant", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], OrderItem.prototype, "color", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], OrderItem.prototype, "size", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1 }),
    __metadata("design:type", Number)
], OrderItem.prototype, "quantity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], OrderItem.prototype, "unitPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], OrderItem.prototype, "costPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 0 }),
    __metadata("design:type", Number)
], OrderItem.prototype, "discount", void 0);
exports.OrderItem = OrderItem = __decorate([
    (0, mongoose_1.Schema)()
], OrderItem);
exports.OrderItemSchema = mongoose_1.SchemaFactory.createForClass(OrderItem);
let CustomerDetailsSnapshot = class CustomerDetailsSnapshot {
};
exports.CustomerDetailsSnapshot = CustomerDetailsSnapshot;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], CustomerDetailsSnapshot.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], CustomerDetailsSnapshot.prototype, "mobile", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], CustomerDetailsSnapshot.prototype, "altMobile", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], CustomerDetailsSnapshot.prototype, "address", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 'Dhaka' }),
    __metadata("design:type", String)
], CustomerDetailsSnapshot.prototype, "division", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'Dhaka' }),
    __metadata("design:type", String)
], CustomerDetailsSnapshot.prototype, "district", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], CustomerDetailsSnapshot.prototype, "upazila", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], CustomerDetailsSnapshot.prototype, "union", void 0);
exports.CustomerDetailsSnapshot = CustomerDetailsSnapshot = __decorate([
    (0, mongoose_1.Schema)()
], CustomerDetailsSnapshot);
exports.CustomerDetailsSnapshotSchema = mongoose_1.SchemaFactory.createForClass(CustomerDetailsSnapshot);
let OrderTimelineEntry = class OrderTimelineEntry {
};
exports.OrderTimelineEntry = OrderTimelineEntry;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], OrderTimelineEntry.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: Date.now }),
    __metadata("design:type", Date)
], OrderTimelineEntry.prototype, "at", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 'SYSTEM' }),
    __metadata("design:type", String)
], OrderTimelineEntry.prototype, "actor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], OrderTimelineEntry.prototype, "note", void 0);
exports.OrderTimelineEntry = OrderTimelineEntry = __decorate([
    (0, mongoose_1.Schema)()
], OrderTimelineEntry);
exports.OrderTimelineEntrySchema = mongoose_1.SchemaFactory.createForClass(OrderTimelineEntry);
let Order = class Order {
};
exports.Order = Order;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true }),
    __metadata("design:type", String)
], Order.prototype, "orderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Customer', required: false, index: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Order.prototype, "customerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: exports.CustomerDetailsSnapshotSchema, required: true }),
    __metadata("design:type", CustomerDetailsSnapshot)
], Order.prototype, "customerDetails", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: OrderStatus, default: OrderStatus.PENDING, index: true }),
    __metadata("design:type", String)
], Order.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING, index: true }),
    __metadata("design:type", String)
], Order.prototype, "paymentStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, enum: FulfillmentStatus, default: FulfillmentStatus.UNFULFILLED }),
    __metadata("design:type", String)
], Order.prototype, "fulfillmentStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'COD' }),
    __metadata("design:type", String)
], Order.prototype, "paymentMethod", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 'bKash' }),
    __metadata("design:type", String)
], Order.prototype, "paymentProvider", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Order.prototype, "paidAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Order.prototype, "dueAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], Order.prototype, "senderMobile", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], Order.prototype, "transactionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: false }),
    __metadata("design:type", Boolean)
], Order.prototype, "isAdvancePaid", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.OrderItemSchema], required: true }),
    __metadata("design:type", Array)
], Order.prototype, "items", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Order.prototype, "subtotal", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Order.prototype, "discount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], Order.prototype, "couponCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 0 }),
    __metadata("design:type", Number)
], Order.prototype, "couponDiscount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Order.prototype, "deliveryCharge", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Order.prototype, "totalAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], Order.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.OrderTimelineEntrySchema], default: [] }),
    __metadata("design:type", Array)
], Order.prototype, "timeline", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            provider: { type: String, default: '' },
            consignmentId: { type: String, default: '' },
            trackingUrl: { type: String, default: '' },
            charge: { type: Number, default: 0 },
            deliveryFee: { type: Number, default: 0 },
            returnFee: { type: Number, default: 0 },
            amountToCollect: { type: Number, default: 0 },
            storeId: { type: Number },
            pathaoStatus: { type: String, default: '' },
            bookedAt: { type: Date },
            pickedUpAt: { type: Date },
            deliveredAt: { type: Date },
            settlementStatus: {
                type: String,
                enum: Object.values(CourierSettlementStatus),
                default: CourierSettlementStatus.NOT_APPLICABLE,
            },
            expectedSettlement: { type: Number, default: 0 },
            actualSettlement: { type: Number, default: 0 },
            settledAt: { type: Date },
            settlementAccount: { type: String, default: '' },
            transactionRef: { type: String, default: '' },
            variance: { type: Number, default: 0 },
            settlementNotes: { type: String, default: '' },
        },
        required: false,
        _id: false,
    }),
    __metadata("design:type", Object)
], Order.prototype, "courier", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            labelVersion: { type: Number, default: 1 },
            lastIssuedAt: { type: Date },
        },
        required: false,
        _id: false,
    }),
    __metadata("design:type", Object)
], Order.prototype, "qr", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], Order.prototype, "cancellationReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            reason: { type: String, default: '' },
            returnedAt: { type: Date },
            refundAmount: { type: Number, default: 0 },
            restocked: { type: Boolean, default: false },
            refundMethod: { type: String, default: 'bKash' },
        },
        required: false,
        _id: false,
    }),
    __metadata("design:type", Object)
], Order.prototype, "returnDetails", void 0);
exports.Order = Order = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Order);
exports.OrderSchema = mongoose_1.SchemaFactory.createForClass(Order);
exports.OrderSchema.index({ createdAt: -1 });
exports.OrderSchema.index({ 'customerDetails.mobile': 1 });
exports.OrderSchema.index({ status: 1, paymentStatus: 1 });
//# sourceMappingURL=order.schema.js.map