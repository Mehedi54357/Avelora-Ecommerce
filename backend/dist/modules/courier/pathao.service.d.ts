import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { PathaoTokenDocument } from '../../schemas/pathao-token.schema';
import { Order, OrderDocument, OrderStatus, CourierSettlementStatus } from '../../schemas/order.schema';
import { SettingsDocument } from '../../schemas/settings.schema';
import { AuditLogService } from '../audit-log/audit-log.service';
export interface PathaoOrderPayload {
    store_id: number;
    merchant_order_id: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    recipient_city: number;
    recipient_zone: number;
    recipient_area?: number;
    delivery_type: number;
    item_type: number;
    special_instruction?: string;
    item_quantity: number;
    item_weight: number;
    amount_to_collect: number;
    item_description: string;
}
export declare class PathaoService {
    private configService;
    private tokenModel;
    private orderModel;
    private settingsModel;
    private auditLogService;
    private readonly logger;
    constructor(configService: ConfigService, tokenModel: Model<PathaoTokenDocument>, orderModel: Model<OrderDocument>, settingsModel: Model<SettingsDocument>, auditLogService: AuditLogService);
    private getBaseUrl;
    private getCredentials;
    getValidAccessToken(): Promise<string>;
    private issueNewToken;
    private refreshAccessToken;
    getStores(): Promise<any>;
    getCities(): Promise<any>;
    getZones(cityId: number | string): Promise<any>;
    getAreas(zoneId: number | string): Promise<any>;
    calculatePricePlan(payload: {
        store_id: number;
        item_type?: number;
        delivery_type?: number;
        item_weight?: number;
        recipient_city: number;
        recipient_zone: number;
    }): Promise<any>;
    createOrder(orderId: string, bookingData: {
        storeId: number;
        recipientCity: number;
        recipientZone: number;
        recipientArea?: number;
        itemWeight?: number;
        specialInstruction?: string;
    }, actorEmail?: string): Promise<{
        success: boolean;
        consignmentId: any;
        deliveryFee: number;
        trackingUrl: string;
        amountToCollect: number;
        expectedSettlement: number;
        order: import("mongoose").Document<unknown, {}, OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    syncConsignmentStatus(orderId: string, actorEmail?: string): Promise<{
        consignmentId: string;
        pathaoStatus: any;
        orderStatus: OrderStatus;
        settlementStatus: CourierSettlementStatus | undefined;
        details: any;
    }>;
    createStore(storeData: {
        name: string;
        contact_name: string;
        contact_number: string;
        secondary_contact?: string;
        otp_number?: string;
        address: string;
        city_id: number;
        zone_id: number;
        area_id: number;
    }): Promise<any>;
    createBulkOrder(orders: any[]): Promise<any>;
    getConfig(): Promise<{
        connectionStatus: string;
        mode: string;
        merchantEmail: string;
        clientId: string;
        clientSecret: string;
        password: string;
        enabled: boolean;
        sandbox: boolean;
        selectedStoreId: any;
        selectedStoreName: any;
        lastSuccessfulSync: Date | null;
        tokenStatus: string;
        apiHealth: string;
        hasCredentials: boolean;
        stores: any[];
    }>;
    updateConfig(payload: {
        clientId?: string;
        clientSecret?: string;
        username?: string;
        password?: string;
        sandbox?: boolean;
        defaultStoreId?: number;
        defaultStoreName?: string;
    }, actorEmail?: string): Promise<{
        success: boolean;
        message: string;
        config: {
            connectionStatus: string;
            mode: string;
            merchantEmail: string;
            clientId: string;
            clientSecret: string;
            password: string;
            enabled: boolean;
            sandbox: boolean;
            selectedStoreId: any;
            selectedStoreName: any;
            lastSuccessfulSync: Date | null;
            tokenStatus: string;
            apiHealth: string;
            hasCredentials: boolean;
            stores: any[];
        };
    }>;
    syncStores(actorEmail?: string): Promise<{
        success: boolean;
        stores: any;
        lastSyncAt: Date;
    }>;
    toggleIntegration(enabled: boolean, actorEmail?: string): Promise<{
        success: boolean;
        enabled: boolean;
        message: string;
    }>;
    setDefaultStore(storeId: number, storeName: string, actorEmail?: string): Promise<{
        success: boolean;
        storeId: number;
        storeName: string;
    }>;
    testConnection(): Promise<{
        success: boolean;
        message: string;
        stores: any;
        lastSyncAt: Date;
    }>;
}
