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
exports.QrScanEventSchema = exports.QrScanEvent = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let QrScanEvent = class QrScanEvent {
};
exports.QrScanEvent = QrScanEvent;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true }),
    __metadata("design:type", String)
], QrScanEvent.prototype, "eventId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'QrToken', required: false, index: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], QrScanEvent.prototype, "tokenId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['ORDER', 'PRODUCT', 'INVENTORY', 'RETURN'], index: true }),
    __metadata("design:type", String)
], QrScanEvent.prototype, "entityType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, required: true, index: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], QrScanEvent.prototype, "entityId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: false, index: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], QrScanEvent.prototype, "actorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 'STAFF' }),
    __metadata("design:type", String)
], QrScanEvent.prototype, "actorRole", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], QrScanEvent.prototype, "action", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['SUCCESS', 'CONFLICT', 'REJECTED', 'FAILED'] }),
    __metadata("design:type", String)
], QrScanEvent.prototype, "result", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], QrScanEvent.prototype, "previousStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], QrScanEvent.prototype, "newStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['CAMERA', 'PHOTO', 'MANUAL'], default: 'CAMERA' }),
    __metadata("design:type", String)
], QrScanEvent.prototype, "source", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, index: true }),
    __metadata("design:type", String)
], QrScanEvent.prototype, "idempotencyKey", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed, required: false }),
    __metadata("design:type", Object)
], QrScanEvent.prototype, "clientInfo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed, required: false }),
    __metadata("design:type", Object)
], QrScanEvent.prototype, "evidence", void 0);
exports.QrScanEvent = QrScanEvent = __decorate([
    (0, mongoose_1.Schema)({ collection: 'qr_scan_events', timestamps: { createdAt: true, updatedAt: false } })
], QrScanEvent);
exports.QrScanEventSchema = mongoose_1.SchemaFactory.createForClass(QrScanEvent);
exports.QrScanEventSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
exports.QrScanEventSchema.index({ actorId: 1, createdAt: -1 });
//# sourceMappingURL=qr-scan-event.schema.js.map