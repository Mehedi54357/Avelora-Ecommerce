import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings, SettingsDocument } from '../../schemas/settings.schema';
import { DeliveryZone, DeliveryZoneDocument } from '../../schemas/delivery-zone.schema';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectModel(Settings.name) private settingsModel: Model<SettingsDocument>,
    @InjectModel(DeliveryZone.name) private deliveryZoneModel: Model<DeliveryZoneDocument>,
  ) {}

  async onModuleInit() {
    await this.seedDefaults();
  }

  private async seedDefaults() {
    const existing = await this.settingsModel.findOne().exec();
    if (!existing) {
      await this.settingsModel.create({
        storeName: 'AVELORA',
        supportEmail: 'support@avelora.com',
        supportPhone: '+880 1800-AVELORA',
        storeAddress: 'Dhaka, Bangladesh',
        orderPrefix: 'AVE',
        invoicePrefix: 'INV',
        codEnabled: true,
        mobileBankingEnabled: true,
        returnWindowDays: 7,
        lowStockThreshold: 5,
        defaultDhakaDeliveryCharge: 70,
        defaultOutsideDhakaDeliveryCharge: 130,
      });
    }

    const existingZones = await this.deliveryZoneModel.countDocuments().exec();
    if (existingZones === 0) {
      await this.deliveryZoneModel.create([
        {
          name: 'Inside Dhaka City',
          districts: ['dhaka'],
          deliveryCharge: 70,
          freeDeliveryThreshold: 5000,
          estimatedDays: '1-2 Days',
          isActive: true,
        },
        {
          name: 'Outside Dhaka (Nationwide)',
          districts: ['*'],
          deliveryCharge: 130,
          freeDeliveryThreshold: 7000,
          estimatedDays: '2-4 Days',
          isActive: true,
        },
      ]);
    }
  }

  // 1. Get Store Settings
  async getSettings(): Promise<Settings> {
    let settings = await this.settingsModel.findOne().exec();
    if (!settings) {
      settings = await this.settingsModel.create({ storeName: 'AVELORA' });
    }
    return settings;
  }

  // 2. Update Store Settings
  async updateSettings(data: Partial<Settings>): Promise<Settings> {
    let settings = await this.settingsModel.findOne().exec();
    if (!settings) {
      return this.settingsModel.create(data);
    }
    Object.assign(settings, data);
    return settings.save();
  }

  // 3. Delivery Zones
  async getDeliveryZones(): Promise<DeliveryZone[]> {
    return this.deliveryZoneModel.find().exec();
  }

  async calculateDeliveryCharge(district: string, subtotal: number): Promise<{ charge: number; zoneName: string; freeDelivery: boolean }> {
    const cleanDist = (district || '').toLowerCase().trim();
    const zones = await this.deliveryZoneModel.find({ isActive: true }).exec();

    // Check specific district match
    const specificZone = zones.find((z) =>
      z.districts.some((d) => d.toLowerCase() === cleanDist || cleanDist.includes(d.toLowerCase())),
    );

    const targetZone = specificZone || zones.find((z) => z.districts.includes('*')) || {
      name: cleanDist.includes('dhaka') ? 'Inside Dhaka' : 'Outside Dhaka',
      deliveryCharge: cleanDist.includes('dhaka') ? 70 : 130,
      freeDeliveryThreshold: 0,
    };

    const isFree = Boolean(
      targetZone.freeDeliveryThreshold &&
      targetZone.freeDeliveryThreshold > 0 &&
      subtotal >= targetZone.freeDeliveryThreshold,
    );

    return {
      charge: isFree ? 0 : targetZone.deliveryCharge,
      zoneName: targetZone.name,
      freeDelivery: isFree,
    };
  }

  async createDeliveryZone(data: Partial<DeliveryZone>): Promise<DeliveryZone> {
    return this.deliveryZoneModel.create(data);
  }

  async updateDeliveryZone(id: string, data: Partial<DeliveryZone>): Promise<DeliveryZone> {
    const updated = await this.deliveryZoneModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!updated) throw new NotFoundException('Delivery zone not found');
    return updated;
  }

  async deleteDeliveryZone(id: string) {
    const result = await this.deliveryZoneModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Delivery zone not found');
    return { success: true };
  }
}
