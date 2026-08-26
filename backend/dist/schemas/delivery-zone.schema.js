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
exports.DeliveryZoneSchema = exports.DeliveryZone = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let DeliveryZone = class DeliveryZone {
    name;
    districts;
    deliveryCharge;
    freeDeliveryThreshold;
    estimatedDays;
    isActive;
};
exports.DeliveryZone = DeliveryZone;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DeliveryZone.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], DeliveryZone.prototype, "districts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], DeliveryZone.prototype, "deliveryCharge", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 0 }),
    __metadata("design:type", Number)
], DeliveryZone.prototype, "freeDeliveryThreshold", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '2-3 Days' }),
    __metadata("design:type", String)
], DeliveryZone.prototype, "estimatedDays", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: true }),
    __metadata("design:type", Boolean)
], DeliveryZone.prototype, "isActive", void 0);
exports.DeliveryZone = DeliveryZone = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], DeliveryZone);
exports.DeliveryZoneSchema = mongoose_1.SchemaFactory.createForClass(DeliveryZone);
//# sourceMappingURL=delivery-zone.schema.js.map