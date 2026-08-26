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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsSchema = exports.Settings = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Settings = class Settings {
    storeName;
    supportEmail;
    supportPhone;
    storeAddress;
    orderPrefix;
    invoicePrefix;
    codEnabled;
    mobileBankingEnabled;
    returnWindowDays;
    lowStockThreshold;
    defaultDhakaDeliveryCharge;
    defaultOutsideDhakaDeliveryCharge;
    pathaoEnabled;
    pathaoSandbox;
    pathaoBaseUrl;
    pathaoClientId;
    pathaoClientSecret;
    pathaoUsername;
    pathaoPassword;
    pathaoDefaultStoreId;
    pathaoDefaultStoreName;
    pathaoLastSyncAt;
};
exports.Settings = Settings;
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'AVELORA' }),
    __metadata("design:type", String)
], Settings.prototype, "storeName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 'aveloraelegance@gmail.com' }),
    __metadata("design:type", String)
], Settings.prototype, "supportEmail", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '+8801353786336' }),
    __metadata("design:type", String)
], Settings.prototype, "supportPhone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 'Dhaka, Bangladesh' }),
    __metadata("design:type", String)
], Settings.prototype, "storeAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 'AVE' }),
    __metadata("design:type", String)
], Settings.prototype, "orderPrefix", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 'INV' }),
    __metadata("design:type", String)
], Settings.prototype, "invoicePrefix", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: true }),
    __metadata("design:type", Boolean)
], Settings.prototype, "codEnabled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: true }),
    __metadata("design:type", Boolean)
], Settings.prototype, "mobileBankingEnabled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 7 }),
    __metadata("design:type", Number)
], Settings.prototype, "returnWindowDays", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 5 }),
    __metadata("design:type", Number)
], Settings.prototype, "lowStockThreshold", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 70 }),
    __metadata("design:type", Number)
], Settings.prototype, "defaultDhakaDeliveryCharge", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 130 }),
    __metadata("design:type", Number)
], Settings.prototype, "defaultOutsideDhakaDeliveryCharge", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: true }),
    __metadata("design:type", Boolean)
], Settings.prototype, "pathaoEnabled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: false }),
    __metadata("design:type", Boolean)
], Settings.prototype, "pathaoSandbox", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], Settings.prototype, "pathaoBaseUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], Settings.prototype, "pathaoClientId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], Settings.prototype, "pathaoClientSecret", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], Settings.prototype, "pathaoUsername", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], Settings.prototype, "pathaoPassword", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: null }),
    __metadata("design:type", Number)
], Settings.prototype, "pathaoDefaultStoreId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], Settings.prototype, "pathaoDefaultStoreName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: null }),
    __metadata("design:type", Date)
], Settings.prototype, "pathaoLastSyncAt", void 0);
exports.Settings = Settings = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Settings);
exports.SettingsSchema = mongoose_1.SchemaFactory.createForClass(Settings);
//# sourceMappingURL=settings.schema.js.map