import { Model, Types } from 'mongoose';
import { QrTokenService } from './qr-token.service';
import { QrScanEvent, QrScanEventDocument } from '../../schemas/qr-scan-event.schema';
import { IdempotencyKeyDocument } from '../../schemas/idempotency-key.schema';
import { ProductDocument } from '../../schemas/product.schema';
import { OrderDocument, OrderStatus } from '../../schemas/order.schema';
import { ConfigService } from '@nestjs/config';
export declare class QrService {
    private readonly qrTokenService;
    private qrScanEventModel;
    private idempotencyKeyModel;
    private productModel;
    private orderModel;
    private readonly configService;
    private readonly logger;
    constructor(qrTokenService: QrTokenService, qrScanEventModel: Model<QrScanEventDocument>, idempotencyKeyModel: Model<IdempotencyKeyDocument>, productModel: Model<ProductDocument>, orderModel: Model<OrderDocument>, configService: ConfigService);
    generateQrCodeDataUrl(payload: string, options?: {
        margin?: number;
        width?: number;
    }): Promise<string>;
    generateQrCodeSvg(payload: string): Promise<string>;
    getOrCreateProductQr(productId: string): Promise<{
        publicCode: string;
        qrDataUrl: string;
        resolveUrl: string;
    }>;
    resolveProductByPublicCode(publicCode: string): Promise<{
        id: string;
        name: string;
        slug: string;
    }>;
    issueOrderFulfillmentQr(orderId: string, adminId?: string): Promise<{
        tokenId: string;
        payload: string;
        qrDataUrl: string;
        expiresAt: Date;
    }>;
    issueCustomerTrackingQr(orderId: string): Promise<{
        payload: string;
        qrDataUrl: string;
        trackUrl: string;
    }>;
    verifyScannedQr(rawPayload: string): Promise<{
        valid: boolean;
        purpose: string;
        entityType: string;
        entityId: string;
        orderSummary?: any;
        productSummary?: any;
        allowedActions: string[];
    }>;
    fulfillOrderQr(rawPayload: string, action: string, actorId?: string, actorRole?: string, idempotencyKey?: string, ordersServiceTransitionFn?: (orderId: string, nextStatus: OrderStatus, actor?: string, note?: string) => Promise<any>): Promise<Record<string, any> | {
        success: boolean;
        eventId: string;
        orderId: string;
        previousStatus: OrderStatus;
        newStatus: OrderStatus.CONFIRMED | OrderStatus.SHIPPED | OrderStatus.DELIVERED;
        fulfilledAt: string;
    } | undefined>;
    getScanEvents(query: {
        limit?: number;
        entityId?: string;
        actorId?: string;
    }): Promise<(import("mongoose").Document<unknown, {}, QrScanEventDocument, {}, import("mongoose").DefaultSchemaOptions> & QrScanEvent & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
}
