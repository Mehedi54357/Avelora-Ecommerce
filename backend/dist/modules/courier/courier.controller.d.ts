import { PathaoService } from './pathao.service';
export declare class CourierController {
    private readonly pathaoService;
    constructor(pathaoService: PathaoService);
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
            lastSuccessfulSync: Date | null;
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
        settlementStatus: import("../../schemas/order.schema").CourierSettlementStatus | undefined;
        details: any;
    }>;
}
