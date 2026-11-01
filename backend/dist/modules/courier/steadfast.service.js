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
var SteadfastService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SteadfastService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_schema_1 = require("../../schemas/order.schema");
const settings_schema_1 = require("../../schemas/settings.schema");
const audit_log_service_1 = require("../audit-log/audit-log.service");
let SteadfastService = SteadfastService_1 = class SteadfastService {
    constructor(orderModel, settingsModel, auditLogService) {
        this.orderModel = orderModel;
        this.settingsModel = settingsModel;
        this.auditLogService = auditLogService;
        this.logger = new common_1.Logger(SteadfastService_1.name);
        this.defaultBaseUrl = 'https://portal.packzy.com/api/v1';
    }
    async getSettings() {
        let settings = await this.settingsModel.findOne().exec();
        if (!settings) {
            settings = await this.settingsModel.create({
                storeName: 'AVELORA',
                steadfastEnabled: true,
                steadfastBaseUrl: this.defaultBaseUrl,
            });
        }
        return settings;
    }
    sanitizeText(text, maxLength) {
        if (!text)
            return '';
        const cleaned = text.replace(/[{};<>$]/g, ' ').trim();
        return cleaned.slice(0, maxLength);
    }
    async getConfig() {
        const settings = await this.getSettings();
        const apiKey = settings.steadfastApiKey || '';
        const secretKey = settings.steadfastSecretKey || '';
        const maskKey = (key) => {
            if (!key)
                return '';
            if (key.length <= 8)
                return '••••••••';
            return `${key.slice(0, 4)}••••${key.slice(-4)}`;
        };
        return {
            enabled: settings.steadfastEnabled ?? true,
            baseUrl: settings.steadfastBaseUrl || this.defaultBaseUrl,
            hasCredentials: Boolean(apiKey && secretKey),
            apiKeyMasked: maskKey(apiKey),
            secretKeyMasked: maskKey(secretKey),
            lastSyncAt: settings.steadfastLastSyncAt || null,
            connectionStatus: (apiKey && secretKey) ? 'Configured' : 'Credentials Missing',
        };
    }
    async updateConfig(data, actorEmail = 'ADMIN') {
        const settings = await this.getSettings();
        if (data.apiKey !== undefined && data.apiKey !== '') {
            settings.steadfastApiKey = data.apiKey.trim();
        }
        if (data.secretKey !== undefined && data.secretKey !== '') {
            settings.steadfastSecretKey = data.secretKey.trim();
        }
        if (data.baseUrl !== undefined && data.baseUrl !== '') {
            settings.steadfastBaseUrl = data.baseUrl.trim();
        }
        if (data.enabled !== undefined) {
            settings.steadfastEnabled = Boolean(data.enabled);
        }
        await settings.save();
        await this.auditLogService.logAction({
            action: 'UPDATE_STEADFAST_CONFIG',
            entityType: 'Settings',
            entityId: settings._id.toString(),
            newData: {
                enabled: settings.steadfastEnabled,
                baseUrl: settings.steadfastBaseUrl,
                hasApiKey: Boolean(settings.steadfastApiKey),
                actor: actorEmail,
            },
        });
        return {
            success: true,
            message: 'Steadfast configuration saved successfully',
            config: await this.getConfig(),
        };
    }
    async toggleIntegration(enabled, actorEmail = 'ADMIN') {
        const settings = await this.getSettings();
        settings.steadfastEnabled = enabled;
        await settings.save();
        await this.auditLogService.logAction({
            action: 'TOGGLE_STEADFAST_INTEGRATION',
            entityType: 'Settings',
            entityId: settings._id.toString(),
            newData: { enabled, actor: actorEmail },
        });
        return { success: true, enabled };
    }
    async testConnection() {
        const settings = await this.getSettings();
        const baseUrl = settings.steadfastBaseUrl || this.defaultBaseUrl;
        try {
            const pingRes = await fetch(`${baseUrl}/ping`, {
                method: 'GET',
                headers: { Accept: 'application/json' },
            });
            if (!pingRes.ok) {
                throw new common_1.BadRequestException(`Steadfast gateway returned status ${pingRes.status} on /ping`);
            }
            if (settings.steadfastApiKey && settings.steadfastSecretKey) {
                const balanceRes = await fetch(`${baseUrl}/get_balance`, {
                    method: 'GET',
                    headers: {
                        'Api-Key': settings.steadfastApiKey,
                        'Secret-Key': settings.steadfastSecretKey,
                        Accept: 'application/json',
                    },
                });
                if (balanceRes.status === 401) {
                    return {
                        success: false,
                        reachable: true,
                        authenticated: false,
                        message: 'Steadfast gateway reachable, but API Key or Secret Key is invalid (401 Unauthorized). Check your Steadfast API keys.',
                    };
                }
                if (balanceRes.status === 403) {
                    return {
                        success: false,
                        reachable: true,
                        authenticated: false,
                        message: 'Steadfast account is pending NID verification/approval (403 Forbidden). Please complete ownership verification on Steadfast merchant portal.',
                    };
                }
                if (balanceRes.ok) {
                    const balanceData = await balanceRes.json();
                    settings.steadfastLastSyncAt = new Date();
                    await settings.save();
                    return {
                        success: true,
                        reachable: true,
                        authenticated: true,
                        balance: balanceData.current_balance ?? balanceData.balance ?? null,
                        message: 'Steadfast Courier API connected and authenticated successfully (200 OK)!',
                    };
                }
            }
            return {
                success: true,
                reachable: true,
                authenticated: false,
                message: 'Steadfast gateway is reachable. Enter API Key & Secret Key to authenticate order booking.',
            };
        }
        catch (err) {
            this.logger.error(`Steadfast connection test failed: ${err.message}`);
            return {
                success: false,
                message: err.message || 'Failed to reach Steadfast Courier Gateway',
            };
        }
    }
    async getBalance() {
        const settings = await this.getSettings();
        if (!settings.steadfastApiKey || !settings.steadfastSecretKey) {
            throw new common_1.BadRequestException('Steadfast API Key and Secret Key are not configured');
        }
        const baseUrl = settings.steadfastBaseUrl || this.defaultBaseUrl;
        const res = await fetch(`${baseUrl}/get_balance`, {
            method: 'GET',
            headers: {
                'Api-Key': settings.steadfastApiKey,
                'Secret-Key': settings.steadfastSecretKey,
                Accept: 'application/json',
            },
        });
        const data = await res.json();
        if (!res.ok) {
            throw new common_1.BadRequestException(data.message || `Steadfast API returned error ${res.status}`);
        }
        return data;
    }
    async createOrder(orderId, bookingData, actorEmail = 'ADMIN') {
        const settings = await this.getSettings();
        if (!settings.steadfastEnabled) {
            throw new common_1.BadRequestException('Steadfast Courier integration is disabled in system settings');
        }
        if (!settings.steadfastApiKey || !settings.steadfastSecretKey) {
            throw new common_1.BadRequestException('Steadfast credentials missing. Please configure API Key & Secret Key in Settings');
        }
        const order = await this.orderModel.findById(orderId).exec();
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.fulfillmentMethod && order.fulfillmentMethod !== 'COURIER') {
            throw new common_1.BadRequestException(`This order is designated for "${order.fulfillmentMethod}". Courier booking is only permitted for COURIER fulfillment.`);
        }
        if (order.courier?.consignmentId && order.courier?.provider === 'Steadfast') {
            throw new common_1.BadRequestException(`Order is already booked with Steadfast Consignment ID: ${order.courier.consignmentId}`);
        }
        let codAmount = 0;
        if (bookingData.codAmount !== undefined) {
            codAmount = Number(bookingData.codAmount);
        }
        else if (order.paymentMethod === 'COD') {
            codAmount = order.dueAmount !== undefined ? order.dueAmount : order.subtotal;
        }
        else if (order.paymentStatus !== 'PAID') {
            codAmount = order.totalAmount;
        }
        const recipientPhone = (order.customerDetails?.mobile || '').replace(/[^0-9+]/g, '');
        const fullAddress = `${order.customerDetails?.address || ''}, ${order.customerDetails?.district || ''}`;
        const payload = {
            invoice: this.sanitizeText(order.orderId, 100),
            recipient_name: this.sanitizeText(order.customerDetails?.name || 'Customer', 100),
            recipient_phone: this.sanitizeText(recipientPhone, 40),
            recipient_address: this.sanitizeText(fullAddress, 490),
            cod_amount: Math.max(0, Math.round(codAmount)),
            note: this.sanitizeText(bookingData.note || order.notes || 'Handle with care - Luxury Apparel', 480),
        };
        const baseUrl = settings.steadfastBaseUrl || this.defaultBaseUrl;
        const url = `${baseUrl}/create_order`;
        this.logger.log(`Booking Steadfast parcel for Order #${order.orderId}`);
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Api-Key': settings.steadfastApiKey,
                'Secret-Key': settings.steadfastSecretKey,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || (data.status && data.status !== 200)) {
            this.logger.error(`Steadfast booking error: ${JSON.stringify(data)}`);
            let message = data.message || 'Steadfast booking rejected by provider';
            if (data.errors) {
                message += `: ${JSON.stringify(data.errors)}`;
            }
            throw new common_1.BadRequestException(message);
        }
        const consignment = data.consignment || {};
        const consignmentId = String(consignment.consignment_id || data.consignment_id || '');
        const trackingCode = String(consignment.tracking_code || data.tracking_code || '');
        const deliveryFee = order.deliveryCharge || 70;
        const expectedSettlement = Math.max(0, codAmount - deliveryFee);
        order.courier = {
            provider: 'Steadfast',
            consignmentId,
            trackingCode,
            trackingUrl: trackingCode ? `https://steadfast.com.bd/t/${trackingCode}` : '',
            charge: deliveryFee,
            deliveryFee,
            amountToCollect: codAmount,
            steadfastStatus: consignment.status || 'in_review',
            bookedAt: new Date(),
            expectedSettlement,
            settlementStatus: order.paymentMethod === 'COD'
                ? order_schema_1.CourierSettlementStatus.AWAITING_SETTLEMENT
                : order_schema_1.CourierSettlementStatus.NOT_APPLICABLE,
        };
        order.timeline.push({
            status: 'COURIER_BOOKED',
            at: new Date(),
            actor: actorEmail,
            note: `Booked via Steadfast Courier. Consignment ID: ${consignmentId}, Tracking Code: ${trackingCode}, COD: ৳${codAmount}`,
        });
        await order.save();
        await this.auditLogService.logAction({
            action: 'STEADFAST_ORDER_BOOKED',
            entityType: 'Order',
            entityId: order._id.toString(),
            newData: {
                orderId: order.orderId,
                provider: 'Steadfast',
                consignmentId,
                trackingCode,
                codAmount,
                actor: actorEmail,
            },
        });
        return {
            success: true,
            message: 'Steadfast parcel booked successfully',
            consignmentId,
            trackingCode,
            trackingUrl: order.courier.trackingUrl,
            order,
        };
    }
    async syncConsignmentStatus(orderId, actorEmail = 'ADMIN') {
        const settings = await this.getSettings();
        if (!settings.steadfastApiKey || !settings.steadfastSecretKey) {
            throw new common_1.BadRequestException('Steadfast credentials missing');
        }
        const order = await this.orderModel.findById(orderId).exec();
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (!order.courier?.consignmentId && !order.courier?.trackingCode && !order.orderId) {
            throw new common_1.BadRequestException('No consignment ID, tracking code, or invoice associated with this order');
        }
        const baseUrl = settings.steadfastBaseUrl || this.defaultBaseUrl;
        let endpoint = '';
        if (order.courier?.consignmentId) {
            endpoint = `${baseUrl}/status_by_cid/${order.courier.consignmentId}`;
        }
        else if (order.courier?.trackingCode) {
            endpoint = `${baseUrl}/status_by_trackingcode/${order.courier.trackingCode}`;
        }
        else {
            endpoint = `${baseUrl}/status_by_invoice/${order.orderId}`;
        }
        const res = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Api-Key': settings.steadfastApiKey,
                'Secret-Key': settings.steadfastSecretKey,
                Accept: 'application/json',
            },
        });
        const data = await res.json();
        if (!res.ok) {
            throw new common_1.BadRequestException(data.message || `Steadfast returned error status ${res.status}`);
        }
        const deliveryStatus = data.delivery_status || data.status || '';
        if (!deliveryStatus) {
            return { success: false, message: 'No delivery status found in response', data };
        }
        order.courier.steadfastStatus = deliveryStatus;
        const normalized = deliveryStatus.toLowerCase();
        let updatedOrderStatus = null;
        if (normalized === 'delivered') {
            updatedOrderStatus = order_schema_1.OrderStatus.DELIVERED;
            order.courier.deliveredAt = new Date();
            if (order.paymentMethod === 'COD') {
                order.courier.settlementStatus = order_schema_1.CourierSettlementStatus.AWAITING_SETTLEMENT;
            }
        }
        else if (normalized === 'cancelled') {
            updatedOrderStatus = order_schema_1.OrderStatus.CANCELLED;
            order.courier.settlementStatus = order_schema_1.CourierSettlementStatus.NOT_APPLICABLE;
        }
        else if (normalized === 'in_review' ||
            normalized === 'pending' ||
            normalized === 'picked_up' ||
            normalized.includes('rider_assigned')) {
            if (order.status === order_schema_1.OrderStatus.PROCESSING || order.status === order_schema_1.OrderStatus.PENDING) {
                updatedOrderStatus = order_schema_1.OrderStatus.SHIPPED;
                order.courier.pickedUpAt = new Date();
            }
        }
        if (updatedOrderStatus && updatedOrderStatus !== order.status) {
            order.status = updatedOrderStatus;
            order.timeline.push({
                status: `STATUS_${updatedOrderStatus}`,
                at: new Date(),
                actor: actorEmail,
                note: `Status updated to ${updatedOrderStatus} via Steadfast tracking sync (${deliveryStatus})`,
            });
        }
        await order.save();
        await this.auditLogService.logAction({
            action: 'STEADFAST_STATUS_SYNC',
            entityType: 'Order',
            entityId: order._id.toString(),
            newData: {
                orderId: order.orderId,
                provider: 'Steadfast',
                deliveryStatus,
                orderStatus: order.status,
                actor: actorEmail,
            },
        });
        return {
            success: true,
            steadfastStatus: deliveryStatus,
            orderStatus: order.status,
            message: `Steadfast consignment status synchronized: ${deliveryStatus}`,
        };
    }
};
exports.SteadfastService = SteadfastService;
exports.SteadfastService = SteadfastService = SteadfastService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(1, (0, mongoose_1.InjectModel)(settings_schema_1.Settings.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        audit_log_service_1.AuditLogService])
], SteadfastService);
//# sourceMappingURL=steadfast.service.js.map