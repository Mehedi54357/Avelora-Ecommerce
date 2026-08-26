import { QrService } from './qr.service';
import { OrdersService } from '../orders/orders.service';
export declare class QrAdminController {
    private readonly qrService;
    private readonly ordersService;
    constructor(qrService: QrService, ordersService: OrdersService);
    getProductQr(id: string): Promise<{
        publicCode: string;
        qrDataUrl: string;
        resolveUrl: string;
    }>;
    issueOrderFulfillmentQr(id: string, req: any): Promise<{
        tokenId: string;
        payload: string;
        qrDataUrl: string;
        expiresAt: Date;
    }>;
    issueCustomerTrackingQr(id: string): Promise<{
        payload: string;
        qrDataUrl: string;
        trackUrl: string;
    }>;
    verifyScannedQr(body: {
        raw: string;
    }): Promise<{
        valid: boolean;
        purpose: string;
        entityType: string;
        entityId: string;
        orderSummary?: any;
        productSummary?: any;
        allowedActions: string[];
    }>;
    fulfillOrder(body: {
        raw: string;
        action: string;
    }, idempotencyKey: string, req: any): Promise<Record<string, any> | {
        success: boolean;
        eventId: string;
        orderId: string;
        previousStatus: import("../../schemas/order.schema").OrderStatus;
        newStatus: import("../../schemas/order.schema").OrderStatus.CONFIRMED | import("../../schemas/order.schema").OrderStatus.SHIPPED | import("../../schemas/order.schema").OrderStatus.DELIVERED;
        fulfilledAt: string;
    } | undefined>;
    getScanEvents(limit?: number, entityId?: string, actorId?: string): Promise<(import("mongoose").Document<unknown, {}, import("../../schemas/qr-scan-event.schema").QrScanEventDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/qr-scan-event.schema").QrScanEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
}
