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
exports.QrTokenSchema = exports.QrToken = exports.QrTokenStatus = exports.QrPurpose = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var QrPurpose;
(function (QrPurpose) {
    QrPurpose["FULFILL_SHIPMENT"] = "FULFILL_SHIPMENT";
    QrPurpose["ORDER_TRACK"] = "ORDER_TRACK";
    QrPurpose["PRODUCT_RESOLVE"] = "PRODUCT_RESOLVE";
    QrPurpose["INVENTORY_LOOKUP"] = "INVENTORY_LOOKUP";
    QrPurpose["RETURN_RECEIVE"] = "RETURN_RECEIVE";
})(QrPurpose || (exports.QrPurpose = QrPurpose = {}));
var QrTokenStatus;
(function (QrTokenStatus) {
    QrTokenStatus["ACTIVE"] = "ACTIVE";
    QrTokenStatus["CONSUMED"] = "CONSUMED";
    QrTokenStatus["REVOKED"] = "REVOKED";
    QrTokenStatus["EXPIRED"] = "EXPIRED";
})(QrTokenStatus || (exports.QrTokenStatus = QrTokenStatus = {}));
let QrToken = class QrToken {
    tokenHash;
    entityType;
    entityId;
    purpose;
    status;
    oneTime;
    issuedBy;
    issuedAt;
    expiresAt;
    consumedAt;
    consumedBy;
    revokedAt;
    revokedBy;
    metadata;
};
exports.QrToken = QrToken;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true }),
    __metadata("design:type", String)
], QrToken.prototype, "tokenHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['ORDER', 'PRODUCT', 'INVENTORY', 'RETURN'] }),
    __metadata("design:type", String)
], QrToken.prototype, "entityType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, required: true, index: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], QrToken.prototype, "entityId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: QrPurpose, index: true }),
    __metadata("design:type", String)
], QrToken.prototype, "purpose", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: QrTokenStatus, default: QrTokenStatus.ACTIVE, index: true }),
    __metadata("design:type", String)
], QrToken.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: true }),
    __metadata("design:type", Boolean)
], QrToken.prototype, "oneTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: false }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], QrToken.prototype, "issuedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: Date.now }),
    __metadata("design:type", Date)
], QrToken.prototype, "issuedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", Date)
], QrToken.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Date)
], QrToken.prototype, "consumedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: false }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], QrToken.prototype, "consumedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Date)
], QrToken.prototype, "revokedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: false }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], QrToken.prototype, "revokedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed, default: {} }),
    __metadata("design:type", Object)
], QrToken.prototype, "metadata", void 0);
exports.QrToken = QrToken = __decorate([
    (0, mongoose_1.Schema)({ collection: 'qr_tokens', timestamps: true })
], QrToken);
exports.QrTokenSchema = mongoose_1.SchemaFactory.createForClass(QrToken);
exports.QrTokenSchema.index({ entityType: 1, entityId: 1, purpose: 1, status: 1 });
//# sourceMappingURL=qr-token.schema.js.map