import { PathaoService } from './pathao.service';
import { SteadfastService } from './steadfast.service';
export declare class CourierController {
    private readonly pathaoService;
    private readonly steadfastService;
    constructor(pathaoService: PathaoService, steadfastService: SteadfastService);
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
        lastSuccessfulSync: Date;
        tokenStatus: string;
        apiHealth: string;
        hasCredentials: boolean;
        stores: any[];
    }>;
    updateConfig(body: any, req: any): Promise<{
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
            lastSuccessfulSync: Date;
            tokenStatus: string;
            apiHealth: string;
            hasCredentials: boolean;
            stores: any[];
        };
    }>;
    syncStores(req: any): Promise<{
        success: boolean;
        stores: any;
        lastSyncAt: Date;
    }>;
    toggleIntegration(body: {
        enabled: boolean;
    }, req: any): Promise<{
        success: boolean;
        enabled: boolean;
        message: string;
    }>;
    setDefaultStore(body: {
        storeId: number;
        storeName: string;
    }, req: any): Promise<{
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
    getStores(): Promise<any>;
    getCities(): Promise<any>;
    getZones(cityId: string): Promise<any>;
    getAreas(zoneId: string): Promise<any>;
    calculatePricePlan(body: any): Promise<any>;
    bookOrder(orderId: string, body: any, req: any): Promise<{
        success: boolean;
        consignmentId: any;
        deliveryFee: number;
        trackingUrl: string;
        amountToCollect: number;
        expectedSettlement: number;
        order: import("mongoose").Document<unknown, {}, import("../../schemas/order.schema").OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/order.schema").Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    syncOrderStatus(orderId: string, req: any): Promise<{
        consignmentId: string;
        pathaoStatus: any;
        orderStatus: import("../../schemas/order.schema").OrderStatus;
        settlementStatus: import("../../schemas/order.schema").CourierSettlementStatus;
        details: any;
    }>;
    getSteadfastConfig(): Promise<{
        enabled: boolean;
        baseUrl: string;
        hasCredentials: boolean;
        apiKeyMasked: string;
        secretKeyMasked: string;
        lastSyncAt: Date;
        connectionStatus: string;
    }>;
    updateSteadfastConfig(body: any, req: any): Promise<{
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
    toggleSteadfast(body: {
        enabled: boolean;
    }, req: any): Promise<{
        success: boolean;
        enabled: boolean;
    }>;
    testSteadfastConnection(): Promise<{
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
    getSteadfastBalance(): Promise<any>;
    bookSteadfastOrder(orderId: string, body: any, req: any): Promise<{
        success: boolean;
        message: string;
        consignmentId: string;
        trackingCode: string;
        trackingUrl: string;
        order: import("mongoose").Document<unknown, {}, import("../../schemas/order.schema").OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/order.schema").Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    syncSteadfastOrderStatus(orderId: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: any;
        steadfastStatus?: undefined;
        orderStatus?: undefined;
    } | {
        success: boolean;
        steadfastStatus: any;
        orderStatus: import("../../schemas/order.schema").OrderStatus;
        message: string;
        data?: undefined;
    }>;
}
