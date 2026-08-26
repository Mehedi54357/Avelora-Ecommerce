"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var QrService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const QRCode = __importStar(require("qrcode"));
const qr_token_service_1 = require("./qr-token.service");
const qr_scan_event_schema_1 = require("../../schemas/qr-scan-event.schema");
const idempotency_key_schema_1 = require("../../schemas/idempotency-key.schema");
const product_schema_1 = require("../../schemas/product.schema");
const order_schema_1 = require("../../schemas/order.schema");
const qr_token_schema_1 = require("../../schemas/qr-token.schema");
const config_1 = require("@nestjs/config");
let QrService = QrService_1 = class QrService {
    qrTokenService;
    qrScanEventModel;
    idempotencyKeyModel;
    productModel;
    orderModel;
    configService;
    logger = new common_1.Logger(QrService_1.name);
    constructor(qrTokenService, qrScanEventModel, idempotencyKeyModel, productModel, orderModel, configService) {
        this.qrTokenService = qrTokenService;
        this.qrScanEventModel = qrScanEventModel;
        this.idempotencyKeyModel = idempotencyKeyModel;
        this.productModel = productModel;
        this.orderModel = orderModel;
        this.configService = configService;
    }
    async generateQrCodeDataUrl(payload, options) {
        return QRCode.toDataURL(payload, {
            margin: options?.margin || 2,
            width: options?.width || 300,
            color: {
                dark: '#0B0F19',
                light: '#FFFFFF',
            },
            errorCorrectionLevel: 'M',
        });
    }
    async generateQrCodeSvg(payload) {
        return QRCode.toString(payload, {
            type: 'svg',
            margin: 2,
            color: {
                dark: '#0B0F19',
                light: '#FFFFFF',
            },
            errorCorrectionLevel: 'M',
        });
    }
    async getOrCreateProductQr(productId) {
        const product = await this.productModel.findById(productId).exec();
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        let publicCode = product.qr?.publicCode;
        if (!publicCode || publicCode.trim() === '') {
            const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
            publicCode = `PRD-${randomSuffix}`;
            product.qr = {
                enabled: true,
                publicCode,
                generatedAt: new Date(),
            };
            await product.save();
        }
        const frontendUrl = (this.configService.get('FRONTEND_URL') || 'https://avelora-ecommerce.vercel.app').split(',')[0].trim();
        const resolveUrl = `${frontendUrl}/q/p/${publicCode}`;
        const qrDataUrl = await this.generateQrCodeDataUrl(resolveUrl);
        return { publicCode, qrDataUrl, resolveUrl };
    }
    async resolveProductByPublicCode(publicCode) {
        const cleanCode = publicCode.trim().toUpperCase();
        const product = await this.productModel.findOne({ 'qr.publicCode': cleanCode }).select('name slug isPublished').exec();
        if (!product) {
            throw new common_1.NotFoundException(`Product with QR code "${cleanCode}" not found`);
        }
        return {
            id: product._id.toString(),
            name: product.name,
            slug: product.slug,
        };
    }
    async issueOrderFulfillmentQr(orderId, adminId) {
        const order = await this.orderModel.findById(orderId).exec();
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const { token, payload } = await this.qrTokenService.createToken({
            entityType: 'ORDER',
            entityId: order._id.toString(),
            purpose: qr_token_schema_1.QrPurpose.FULFILL_SHIPMENT,
            expiresInSeconds: 604800,
            oneTime: true,
            issuedBy: adminId,
            metadata: { orderReferenceId: order.orderId },
        });
        order.qr = {
            labelVersion: (order.qr?.labelVersion || 0) + 1,
            lastIssuedAt: new Date(),
        };
        await order.save();
        const qrDataUrl = await this.generateQrCodeDataUrl(payload);
        return {
            tokenId: token._id.toString(),
            payload,
            qrDataUrl,
            expiresAt: token.expiresAt,
        };
    }
    async issueCustomerTrackingQr(orderId) {
        const order = await this.orderModel.findById(orderId).exec();
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const { payload } = await this.qrTokenService.createToken({
            entityType: 'ORDER',
            entityId: order._id.toString(),
            purpose: qr_token_schema_1.QrPurpose.ORDER_TRACK,
            expiresInSeconds: 2592000,
            oneTime: false,
            prefix: 'AV1:T:',
            metadata: { orderReferenceId: order.orderId },
        });
        const frontendUrl = (this.configService.get('FRONTEND_URL') || 'https://avelora-ecommerce.vercel.app').split(',')[0].trim();
        const trackUrl = `${frontendUrl}/q/o/${encodeURIComponent(payload)}`;
        const qrDataUrl = await this.generateQrCodeDataUrl(trackUrl);
        return { payload, qrDataUrl, trackUrl };
    }
    async verifyScannedQr(rawPayload) {
        const token = await this.qrTokenService.verifyRawToken(rawPayload);
        if (token.entityType === 'ORDER') {
            const order = await this.orderModel.findById(token.entityId).exec();
            if (!order) {
                throw new common_1.NotFoundException('Target order record not found');
            }
            const allowedActions = [];
            if (order.status === order_schema_1.OrderStatus.PROCESSING || order.status === order_schema_1.OrderStatus.CONFIRMED) {
                allowedActions.push('MARK_SHIPPED');
            }
            else if (order.status === order_schema_1.OrderStatus.SHIPPED) {
                allowedActions.push('MARK_DELIVERED');
            }
            else if (order.status === order_schema_1.OrderStatus.PENDING) {
                allowedActions.push('CONFIRM_ORDER');
            }
            return {
                valid: true,
                purpose: token.purpose,
                entityType: 'ORDER',
                entityId: token.entityId.toString(),
                orderSummary: {
                    id: order._id,
                    orderId: order.orderId,
                    customerName: order.customerDetails?.name,
                    customerDistrict: order.customerDetails?.district,
                    status: order.status,
                    paymentStatus: order.paymentStatus,
                    paymentMethod: order.paymentMethod,
                    totalAmount: order.totalAmount,
                    dueAmount: order.dueAmount,
                    itemsCount: order.items?.length || 0,
                    items: order.items.map((i) => ({
                        name: i.productName,
                        sku: i.sku,
                        variant: i.variant,
                        quantity: i.quantity,
                    })),
                },
                allowedActions,
            };
        }
        if (token.entityType === 'PRODUCT') {
            const product = await this.productModel.findById(token.entityId).exec();
            return {
                valid: true,
                purpose: token.purpose,
                entityType: 'PRODUCT',
                entityId: token.entityId.toString(),
                productSummary: {
                    id: product?._id,
                    name: product?.name,
                    slug: product?.slug,
                    salePrice: product?.salePrice,
                },
                allowedActions: ['VIEW_CATALOG'],
            };
        }
        return {
            valid: true,
            purpose: token.purpose,
            entityType: token.entityType,
            entityId: token.entityId.toString(),
            allowedActions: [],
        };
    }
    async fulfillOrderQr(rawPayload, action, actorId, actorRole = 'STAFF', idempotencyKey, ordersServiceTransitionFn) {
        if (idempotencyKey) {
            const existingIdempotency = await this.idempotencyKeyModel
                .findOne({ scope: 'qr.fulfill', key: idempotencyKey })
                .exec();
            if (existingIdempotency && existingIdempotency.state === 'COMPLETED') {
                this.logger.log(`Idempotent fulfillment replay for key: ${idempotencyKey}`);
                return existingIdempotency.responseBody;
            }
        }
        const token = await this.qrTokenService.verifyRawToken(rawPayload, qr_token_schema_1.QrPurpose.FULFILL_SHIPMENT);
        const order = await this.orderModel.findById(token.entityId).exec();
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const previousStatus = order.status;
        let nextStatus = order_schema_1.OrderStatus.SHIPPED;
        if (action === 'MARK_DELIVERED') {
            nextStatus = order_schema_1.OrderStatus.DELIVERED;
        }
        else if (action === 'MARK_SHIPPED') {
            nextStatus = order_schema_1.OrderStatus.SHIPPED;
        }
        else if (action === 'CONFIRM_ORDER') {
            nextStatus = order_schema_1.OrderStatus.CONFIRMED;
        }
        await this.qrTokenService.consumeToken(token._id.toString(), actorId);
        let updatedOrder = order;
        if (ordersServiceTransitionFn) {
            updatedOrder = await ordersServiceTransitionFn(order._id.toString(), nextStatus, actorRole, `Fulfilled via QR Scanner (${action})`);
        }
        else {
            order.status = nextStatus;
            order.timeline.push({
                status: nextStatus,
                at: new Date(),
                actor: actorRole,
                note: `Fulfilled via QR Scanner (${action})`,
            });
            updatedOrder = await order.save();
        }
        const eventId = `QSE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        await this.qrScanEventModel.create({
            eventId,
            tokenId: token._id,
            entityType: 'ORDER',
            entityId: order._id,
            actorId: actorId && mongoose_2.Types.ObjectId.isValid(actorId) ? new mongoose_2.Types.ObjectId(actorId) : undefined,
            actorRole,
            action,
            result: 'SUCCESS',
            previousStatus,
            newStatus: nextStatus,
            source: 'CAMERA',
            idempotencyKey,
        });
        const result = {
            success: true,
            eventId,
            orderId: order.orderId,
            previousStatus,
            newStatus: nextStatus,
            fulfilledAt: new Date().toISOString(),
        };
        if (idempotencyKey) {
            try {
                await this.idempotencyKeyModel.create({
                    scope: 'qr.fulfill',
                    actorId: actorId && mongoose_2.Types.ObjectId.isValid(actorId) ? new mongoose_2.Types.ObjectId(actorId) : undefined,
                    key: idempotencyKey,
                    requestHash: this.qrTokenService.hashToken(rawPayload + action),
                    state: 'COMPLETED',
                    responseStatus: 200,
                    responseBody: result,
                    expiresAt: new Date(Date.now() + 86400 * 1000),
                });
            }
            catch (e) {
                this.logger.warn(`Non-critical idempotency logging warning: ${e.message}`);
            }
        }
        return result;
    }
    async getScanEvents(query) {
        const filter = {};
        if (query.entityId)
            filter.entityId = new mongoose_2.Types.ObjectId(query.entityId);
        if (query.actorId)
            filter.actorId = new mongoose_2.Types.ObjectId(query.actorId);
        const limit = Math.max(1, Math.min(200, Number(query.limit) || 50));
        return this.qrScanEventModel
            .find(filter)
            .populate('actorId', 'name email role')
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();
    }
};
exports.QrService = QrService;
exports.QrService = QrService = QrService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)(qr_scan_event_schema_1.QrScanEvent.name)),
    __param(2, (0, mongoose_1.InjectModel)(idempotency_key_schema_1.IdempotencyKey.name)),
    __param(3, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(4, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __metadata("design:paramtypes", [qr_token_service_1.QrTokenService,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        config_1.ConfigService])
], QrService);
//# sourceMappingURL=qr.service.js.map