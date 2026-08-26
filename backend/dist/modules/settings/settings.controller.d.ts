import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
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
}
