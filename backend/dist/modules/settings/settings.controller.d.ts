import { SettingsService } from './settings.service';
import { DataManagementService } from './data-management.service';
export declare class SettingsController {
    private readonly settingsService;
    private readonly dataManagementService;
    constructor(settingsService: SettingsService, dataManagementService: DataManagementService);
    getPublicSettings(): Promise<{
        storeName: string;
        supportEmail: string;
        supportPhone: string;
        storeAddress: string;
        codEnabled: boolean;
        mobileBankingEnabled: boolean;
        returnWindowDays: number;
        defaultDhakaDeliveryCharge: number;
        defaultOutsideDhakaDeliveryCharge: number;
    }>;
    calculateDelivery(district: string, subtotal: number): Promise<{
        charge: number;
        zoneName: string;
        freeDelivery: boolean;
    }>;
    getAdminSettings(): Promise<import("../../schemas/settings.schema").Settings>;
    updateAdminSettings(body: any): Promise<import("../../schemas/settings.schema").Settings>;
    getDeliveryZones(): Promise<import("../../schemas/delivery-zone.schema").DeliveryZone[]>;
    createDeliveryZone(body: any): Promise<import("../../schemas/delivery-zone.schema").DeliveryZone>;
    updateDeliveryZone(id: string, body: any): Promise<import("../../schemas/delivery-zone.schema").DeliveryZone>;
    deleteDeliveryZone(id: string): Promise<{
        success: boolean;
    }>;
    getTestDataSummary(): Promise<{
        testProductsCount: number;
        testOrdersCount: number;
        testTxnsCount: number;
        testReservationsCount: number;
        testPaymentsCount: number;
        testReturnsCount: number;
        testProducts: (import("../../schemas/product.schema").Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        testOrders: (import("../../schemas/order.schema").Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
    }>;
    cleanupTestData(body: any, req: any): Promise<{
        success: boolean;
        deletedOrdersCount: number;
        deletedProductsCount: number;
        message: string;
    }>;
}
