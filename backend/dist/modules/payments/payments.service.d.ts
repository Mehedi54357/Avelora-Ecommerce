import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { PaymentDocument } from '../../schemas/payment.schema';
import { OrderDocument, PaymentStatus } from '../../schemas/order.schema';
import { IdempotencyKeyDocument } from '../../schemas/idempotency-key.schema';
export declare class PaymentsService {
    private paymentModel;
    private orderModel;
    private idempotencyModel;
    private configService;
    private readonly logger;
    constructor(paymentModel: Model<PaymentDocument>, orderModel: Model<OrderDocument>, idempotencyModel: Model<IdempotencyKeyDocument>, configService: ConfigService);
    getGatewayStatus(): {
        status: string;
        availableMethods: string[];
        message: string;
    };
    processPaymentIpn(payload: {
        transactionId: string;
        orderId: string;
        amount: number;
        currency?: string;
        status: string;
        provider: string;
        gatewaySignature?: string;
    }): Promise<{
        success: boolean;
        message: string;
        payment: Record<string, any> | undefined;
        orderId?: undefined;
        transactionId?: undefined;
        paymentStatus?: undefined;
    } | {
        success: boolean;
        orderId: string;
        transactionId: string;
        paymentStatus: PaymentStatus;
        message?: undefined;
        payment?: undefined;
    }>;
    processRefund(paymentId: string, refundAmount: number, reason: string): Promise<{
        success: boolean;
        paymentId: Types.ObjectId;
        refundedAmount: number;
        status: string;
    }>;
}
