import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../../schemas/order.schema';
import { SettingsDocument } from '../../schemas/settings.schema';
import { AuditLogService } from '../audit-log/audit-log.service';
export interface SteadfastOrderPayload {
    invoice: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    cod_amount: number;
    note?: string;
}
export declare class SteadfastService {
    private readonly orderModel;
    private readonly settingsModel;
    private readonly auditLogService;
    private readonly logger;
    private readonly defaultBaseUrl;
    constructor(orderModel: Model<OrderDocument>, settingsModel: Model<SettingsDocument>, auditLogService: AuditLogService);
    private getSettings;
    private sanitizeText;
    getConfig(): Promise<{
        enabled: boolean;
        baseUrl: string;
        hasCredentials: boolean;
        apiKeyMasked: string;
        secretKeyMasked: string;
        lastSyncAt: Date;
        connectionStatus: string;
    }>;
    updateConfig(data: {
        apiKey?: string;
        secretKey?: string;
        baseUrl?: string;
        enabled?: boolean;
    }, actorEmail?: string): Promise<{
        success: boolean;
        message: string;
        config: {
            enabled: boolean;
            baseUrl: string;
            hasCredentials: boolean;
            apiKeyMasked: string;
            secretKeyMasked: string;
            lastSyncAt: Date;
            connectionStatus: string;
        };
    }>;
    toggleIntegration(enabled: boolean, actorEmail?: string): Promise<{
        success: boolean;
        enabled: boolean;
    }>;
    testConnection(): Promise<{
        success: boolean;
        reachable: boolean;
        authenticated: boolean;
        message: string;
        balance?: undefined;
    } | {
        success: boolean;
        reachable: boolean;
        authenticated: boolean;
        balance: any;
        message: string;
    } | {
        success: boolean;
        message: any;
        reachable?: undefined;
        authenticated?: undefined;
        balance?: undefined;
    }>;
    getBalance(): Promise<any>;
    createOrder(orderId: string, bookingData: {
        note?: string;
        codAmount?: number;
    }, actorEmail?: string): Promise<{
        success: boolean;
        message: string;
        consignmentId: string;
        trackingCode: string;
        trackingUrl: string;
        order: import("mongoose").Document<unknown, {}, OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    syncConsignmentStatus(orderId: string, actorEmail?: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        steadfastStatus?: undefined;
        orderStatus?: undefined;
    } | {
        success: boolean;
        steadfastStatus: any;
        orderStatus: OrderStatus;
        message: string;
        data?: undefined;
    }>;
}
