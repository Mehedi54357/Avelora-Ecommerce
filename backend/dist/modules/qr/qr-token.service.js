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
exports.QrTokenService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const crypto_1 = require("crypto");
const qr_token_schema_1 = require("../../schemas/qr-token.schema");
let QrTokenService = class QrTokenService {
    qrTokenModel;
    constructor(qrTokenModel) {
        this.qrTokenModel = qrTokenModel;
    }
    hashToken(rawToken) {
        return (0, crypto_1.createHash)('sha256').update(rawToken.trim()).digest('hex');
    }
    generateRawToken(prefix = 'AV1:F:') {
        const rawSecret = (0, crypto_1.randomBytes)(24).toString('base64url');
        const payload = `${prefix}${rawSecret}`;
        const tokenHash = this.hashToken(payload);
        return { rawToken: rawSecret, payload, tokenHash };
    }
    async createToken(params) {
        const { payload, tokenHash } = this.generateRawToken(params.prefix || (params.purpose === qr_token_schema_1.QrPurpose.FULFILL_SHIPMENT ? 'AV1:F:' : 'AV1:T:'));
        const ttl = params.expiresInSeconds || 604800;
        const expiresAt = new Date(Date.now() + ttl * 1000);
        const token = await this.qrTokenModel.create({
            tokenHash,
            entityType: params.entityType,
            entityId: new mongoose_2.Types.ObjectId(params.entityId),
            purpose: params.purpose,
            status: qr_token_schema_1.QrTokenStatus.ACTIVE,
            oneTime: params.oneTime !== undefined ? params.oneTime : true,
            issuedBy: params.issuedBy && mongoose_2.Types.ObjectId.isValid(params.issuedBy) ? new mongoose_2.Types.ObjectId(params.issuedBy) : undefined,
            issuedAt: new Date(),
            expiresAt,
            metadata: params.metadata || {},
        });
        return { token, payload };
    }
    async verifyRawToken(rawPayload, requiredPurpose) {
        if (!rawPayload || !rawPayload.trim()) {
            throw new common_1.BadRequestException('QR token payload is required');
        }
        const tokenHash = this.hashToken(rawPayload);
        const token = await this.qrTokenModel.findOne({ tokenHash }).exec();
        if (!token) {
            throw new common_1.NotFoundException('Invalid or unrecognized QR token');
        }
        if (token.status === qr_token_schema_1.QrTokenStatus.REVOKED) {
            throw new common_1.BadRequestException('This QR token has been revoked by an administrator');
        }
        if (token.status === qr_token_schema_1.QrTokenStatus.CONSUMED || token.consumedAt) {
            throw new common_1.ConflictException('This QR token has already been scanned and fulfilled');
        }
        if (new Date() > new Date(token.expiresAt)) {
            token.status = qr_token_schema_1.QrTokenStatus.EXPIRED;
            await token.save();
            throw new common_1.BadRequestException('This QR token has expired');
        }
        if (requiredPurpose && token.purpose !== requiredPurpose) {
            throw new common_1.BadRequestException(`QR token purpose mismatch. Expected "${requiredPurpose}", got "${token.purpose}"`);
        }
        return token;
    }
    async consumeToken(tokenId, actorId) {
        const actorObjId = actorId && mongoose_2.Types.ObjectId.isValid(actorId) ? new mongoose_2.Types.ObjectId(actorId) : undefined;
        const token = await this.qrTokenModel.findOneAndUpdate({
            _id: new mongoose_2.Types.ObjectId(tokenId),
            status: qr_token_schema_1.QrTokenStatus.ACTIVE,
            consumedAt: { $exists: false },
        }, {
            $set: {
                status: qr_token_schema_1.QrTokenStatus.CONSUMED,
                consumedAt: new Date(),
                consumedBy: actorObjId,
            },
        }, { new: true }).exec();
        if (!token) {
            throw new common_1.ConflictException('Failed to consume QR token: it may have already been consumed or invalidated.');
        }
        return token;
    }
    async revokeToken(tokenId, actorId) {
        const actorObjId = actorId && mongoose_2.Types.ObjectId.isValid(actorId) ? new mongoose_2.Types.ObjectId(actorId) : undefined;
        const token = await this.qrTokenModel.findByIdAndUpdate(tokenId, {
            $set: {
                status: qr_token_schema_1.QrTokenStatus.REVOKED,
                revokedAt: new Date(),
                revokedBy: actorObjId,
            },
        }, { new: true }).exec();
        if (!token) {
            throw new common_1.NotFoundException('QR token not found');
        }
        return token;
    }
};
exports.QrTokenService = QrTokenService;
exports.QrTokenService = QrTokenService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(qr_token_schema_1.QrToken.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], QrTokenService);
//# sourceMappingURL=qr-token.service.js.map