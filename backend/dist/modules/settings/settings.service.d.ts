import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { Settings, SettingsDocument } from '../../schemas/settings.schema';
import { DeliveryZone, DeliveryZoneDocument } from '../../schemas/delivery-zone.schema';
export declare class SettingsService implements OnModuleInit {
    private settingsModel;
    private deliveryZoneModel;
    constructor(settingsModel: Model<SettingsDocument>, deliveryZoneModel: Model<DeliveryZoneDocument>);
    onModuleInit(): Promise<void>;
    private seedDefaults;
    getSettings(): Promise<Settings>;
    updateSettings(data: Partial<Settings>): Promise<Settings>;
    getDeliveryZones(): Promise<DeliveryZone[]>;
    calculateDeliveryCharge(district: string, subtotal: number): Promise<{
        charge: number;
        zoneName: string;
        freeDelivery: boolean;
    }>;
    createDeliveryZone(data: Partial<DeliveryZone>): Promise<DeliveryZone>;
    updateDeliveryZone(id: string, data: Partial<DeliveryZone>): Promise<DeliveryZone>;
    deleteDeliveryZone(id: string): Promise<{
        success: boolean;
    }>;
}
