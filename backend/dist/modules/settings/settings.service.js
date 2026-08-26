"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const settings_schema_1 = require("../../schemas/settings.schema");
const delivery_zone_schema_1 = require("../../schemas/delivery-zone.schema");
let SettingsService = class SettingsService {
    settingsModel;
    deliveryZoneModel;
    constructor(settingsModel, deliveryZoneModel) {
        this.settingsModel = settingsModel;
        this.deliveryZoneModel = deliveryZoneModel;
    }
    async onModuleInit() {
        await this.seedDefaults();
    }
    async seedDefaults() {
        const existing = await this.settingsModel.findOne().exec();
        if (!existing) {
            await this.settingsModel.create({
                storeName: 'AVELORA',
                supportEmail: 'aveloraelegance@gmail.com',
                supportPhone: '+8801353786336',
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
    async getSettings() {
        let settings = await this.settingsModel.findOne().exec();
        if (!settings) {
            settings = await this.settingsModel.create({ storeName: 'AVELORA' });
        }
        return settings;
    }
    async updateSettings(data) {
        let settings = await this.settingsModel.findOne().exec();
        if (!settings) {
            return this.settingsModel.create(data);
        }
        Object.assign(settings, data);
        return settings.save();
    }
    async getDeliveryZones() {
        return this.deliveryZoneModel.find().exec();
    }
    async calculateDeliveryCharge(district, subtotal) {
        const cleanDist = (district || '').toLowerCase().trim();
        const zones = await this.deliveryZoneModel.find({ isActive: true }).exec();
        const specificZone = zones.find((z) => z.districts.some((d) => d.toLowerCase() === cleanDist || cleanDist.includes(d.toLowerCase())));
        const targetZone = specificZone || zones.find((z) => z.districts.includes('*')) || {
            name: cleanDist.includes('dhaka') ? 'Inside Dhaka' : 'Outside Dhaka',
            deliveryCharge: cleanDist.includes('dhaka') ? 70 : 130,
            freeDeliveryThreshold: 0,
        };
        const isFree = Boolean(targetZone.freeDeliveryThreshold &&
            targetZone.freeDeliveryThreshold > 0 &&
            subtotal >= targetZone.freeDeliveryThreshold);
        return {
            charge: isFree ? 0 : targetZone.deliveryCharge,
            zoneName: targetZone.name,
            freeDelivery: isFree,
        };
    }
    async createDeliveryZone(data) {
        return this.deliveryZoneModel.create(data);
    }
    async updateDeliveryZone(id, data) {
        const updated = await this.deliveryZoneModel.findByIdAndUpdate(id, data, { new: true }).exec();
        if (!updated)
            throw new common_1.NotFoundException('Delivery zone not found');
        return updated;
    }
    async deleteDeliveryZone(id) {
        const result = await this.deliveryZoneModel.findByIdAndDelete(id).exec();
        if (!result)
            throw new common_1.NotFoundException('Delivery zone not found');
        return { success: true };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(settings_schema_1.Settings.name)),
    __param(1, (0, mongoose_1.InjectModel)(delivery_zone_schema_1.DeliveryZone.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], SettingsService);
//# sourceMappingURL=settings.service.js.map