import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    getGatewayStatus(): {
        status: string;
        availableMethods: string[];
        message: string;
    };
    processIpn(body: any): Promise<{
        success: boolean;
        message: string;
        payment: Record<string, any>;
        orderId?: undefined;
        transactionId?: undefined;
        paymentStatus?: undefined;
    } | {
        success: boolean;
        orderId: string;
        transactionId: string;
        paymentStatus: import("../../schemas/order.schema").PaymentStatus;
        message?: undefined;
        payment?: undefined;
    }>;
    processRefund(body: {
        paymentId: string;
        amount: number;
        reason: string;
    }): Promise<{
        success: boolean;
        paymentId: import("mongoose").Types.ObjectId;
        refundedAmount: number;
        status: string;
    }>;
}
