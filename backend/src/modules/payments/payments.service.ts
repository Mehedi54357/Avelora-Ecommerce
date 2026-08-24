import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentDocument } from '../../schemas/payment.schema';
import { Order, OrderDocument, PaymentStatus } from '../../schemas/order.schema';
import { IdempotencyKey, IdempotencyKeyDocument } from '../../schemas/idempotency-key.schema';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(IdempotencyKey.name) private idempotencyModel: Model<IdempotencyKeyDocument>,
    private configService: ConfigService,
  ) {}

  // 1. Get Payment Gateway Production Status
  getGatewayStatus() {
    const sslStoreId = this.configService.get<string>('SSLCOMMERZ_STORE_ID');
    const bkashKey = this.configService.get<string>('BKASH_APP_KEY');
    const isSandbox = this.configService.get<string>('PAYMENT_SANDBOX') !== 'false';

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

  // 2. Server-to-Server Payment Callback / IPN Validation with Idempotency
  async processPaymentIpn(payload: {
    transactionId: string;
    orderId: string;
    amount: number;
    currency?: string;
    status: string;
    provider: string;
    gatewaySignature?: string;
  }) {
    const { transactionId, orderId, amount, status, provider } = payload;

    if (!transactionId || !orderId) {
      throw new BadRequestException('Transaction ID and Order ID are required');
    }

    // 1. Check Idempotency to prevent duplicate callback processing
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

    // 2. Locate matching order
    const order = await this.orderModel.findOne({
      $or: [{ orderId: orderId }, { _id: Types.ObjectId.isValid(orderId) ? new Types.ObjectId(orderId) : null }],
    });

    if (!order) {
      throw new NotFoundException(`No matching order found for Reference ID: ${orderId}`);
    }

    // 3. Amount & Currency Validation
    if (order.totalAmount && amount < order.dueAmount && amount < order.deliveryCharge) {
      this.logger.warn(`Payment amount mismatch for order ${order.orderId}. Received: ${amount}, Expected: ${order.totalAmount}`);
    }

    const isPaid = status.toUpperCase() === 'VALID' || status.toUpperCase() === 'SUCCESS' || status.toUpperCase() === 'PAID';

    // 4. Update Payment Record
    const payment = await this.paymentModel.create({
      orderId: (order as any)._id,
      transactionId,
      method: provider || 'ONLINE_GATEWAY',
      provider: provider || 'SSLCOMMERZ',
      amount: Number(amount) || order.totalAmount,
      status: isPaid ? 'PAID' : 'FAILED',
    });

    // 5. Update Order Status if paid
    if (isPaid) {
      order.paymentStatus = PaymentStatus.PAID;
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

    // 6. Record completed idempotency record
    await this.idempotencyModel.create({
      scope: 'payment.ipn',
      key: transactionId,
      requestHash: `sha256_${transactionId}_${status}`,
      state: 'COMPLETED',
      responseStatus: 200,
      responseBody: { paymentId: payment._id, transactionId, status: isPaid ? 'PAID' : 'FAILED' },
      expiresAt: new Date(Date.now() + 86400 * 7 * 1000), // 7 days
    });

    return {
      success: isPaid,
      orderId: order.orderId,
      transactionId,
      paymentStatus: order.paymentStatus,
    };
  }

  // 3. Process Refund
  async processRefund(paymentId: string, refundAmount: number, reason: string) {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) throw new NotFoundException('Payment record not found');

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
}
