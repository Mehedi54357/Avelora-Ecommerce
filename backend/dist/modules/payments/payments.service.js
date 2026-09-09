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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const config_1 = require("@nestjs/config");
const payment_schema_1 = require("../../schemas/payment.schema");
const order_schema_1 = require("../../schemas/order.schema");
const idempotency_key_schema_1 = require("../../schemas/idempotency-key.schema");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(paymentModel, orderModel, idempotencyModel, configService) {
        this.paymentModel = paymentModel;
        this.orderModel = orderModel;
        this.idempotencyModel = idempotencyModel;
        this.configService = configService;
        this.logger = new common_1.Logger(PaymentsService_1.name);
    }
    getGatewayStatus() {
        const sslStoreId = this.configService.get('SSLCOMMERZ_STORE_ID');
        const bkashKey = this.configService.get('BKASH_APP_KEY');
        const isSandbox = this.configService.get('PAYMENT_SANDBOX') !== 'false';
        const hasLiveCredentials = Boolean(sslStoreId || bkashKey);
        return {
            status: hasLiveCredentials ? (isSandbox ? 'SANDBOX_ACTIVE' : 'PRODUCTION_ACTIVE') : 'COD_ONLY_ACTIVE',
            availableMethods: hasLiveCredentials
                ? ['CASH_ON_DELIVERY', 'BKASH_DIRECT', 'SSLCOMMERZ_GATEWAY']
                : ['CASH_ON_DELIVERY'],
            message: hasLiveCredentials
                ? 'Digital payment gateway configured'
                : 'Digital merchant credentials pending. Operating in production Cash on Delivery mode with advance delivery verification.',
        };
    }
    async processPaymentIpn(payload) {
        const { transactionId, orderId, amount, status, provider } = payload;
        if (!transactionId || !orderId) {
            throw new common_1.BadRequestException('Transaction ID and Order ID are required');
        }
        const existingIdemp = await this.idempotencyModel.findOne({
            scope: 'payment.ipn',
            key: transactionId,
        });
        if (existingIdemp) {
            this.logger.log(`Duplicate IPN ignored for transaction: ${transactionId}`);
            return {
                success: true,
                message: 'Payment notification already processed idempotently',
                payment: existingIdemp.responseBody,
            };
        }
        const order = await this.orderModel.findOne({
            $or: [{ orderId: orderId }, { _id: mongoose_2.Types.ObjectId.isValid(orderId) ? new mongoose_2.Types.ObjectId(orderId) : null }],
        });
        if (!order) {
            throw new common_1.NotFoundException(`No matching order found for Reference ID: ${orderId}`);
        }
        if (order.totalAmount && amount < order.dueAmount && amount < order.deliveryCharge) {
            this.logger.warn(`Payment amount mismatch for order ${order.orderId}. Received: ${amount}, Expected: ${order.totalAmount}`);
        }
        const isPaid = status.toUpperCase() === 'VALID' || status.toUpperCase() === 'SUCCESS' || status.toUpperCase() === 'PAID';
        const payment = await this.paymentModel.create({
            orderId: order._id,
            transactionId,
            method: provider || 'ONLINE_GATEWAY',
            provider: provider || 'SSLCOMMERZ',
            amount: Number(amount) || order.totalAmount,
            status: isPaid ? 'PAID' : 'FAILED',
        });
        if (isPaid) {
            order.paymentStatus = order_schema_1.PaymentStatus.PAID;
            order.paidAmount = (order.paidAmount || 0) + Number(amount);
            order.dueAmount = Math.max(0, order.totalAmount - order.paidAmount);
            order.transactionId = transactionId;
            order.paymentProvider = provider;
            order.timeline.push({
                status: 'PAYMENT_VERIFIED',
                at: new Date(),
                actor: 'GATEWAY_IPN',
                note: `Payment verified via ${provider}. TrxID: ${transactionId}. Amount: ৳${amount}`,
            });
            await order.save();
        }
        await this.idempotencyModel.create({
            scope: 'payment.ipn',
            key: transactionId,
            requestHash: `sha256_${transactionId}_${status}`,
            state: 'COMPLETED',
            responseStatus: 200,
            responseBody: { paymentId: payment._id, transactionId, status: isPaid ? 'PAID' : 'FAILED' },
            expiresAt: new Date(Date.now() + 86400 * 7 * 1000),
        });
        return {
            success: isPaid,
            orderId: order.orderId,
            transactionId,
            paymentStatus: order.paymentStatus,
        };
    }
    async processRefund(paymentId, refundAmount, reason) {
        const payment = await this.paymentModel.findById(paymentId);
        if (!payment)
            throw new common_1.NotFoundException('Payment record not found');
        payment.refundedAmount = (payment.refundedAmount || 0) + Number(refundAmount);
        payment.status = payment.refundedAmount >= payment.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
        await payment.save();
        return {
            success: true,
            paymentId: payment._id,
            refundedAmount: payment.refundedAmount,
            status: payment.status,
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(payment_schema_1.Payment.name)),
    __param(1, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(2, (0, mongoose_1.InjectModel)(idempotency_key_schema_1.IdempotencyKey.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map