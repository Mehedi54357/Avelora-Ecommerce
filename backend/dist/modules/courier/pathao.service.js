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
var PathaoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathaoService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const pathao_token_schema_1 = require("../../schemas/pathao-token.schema");
const order_schema_1 = require("../../schemas/order.schema");
const settings_schema_1 = require("../../schemas/settings.schema");
const audit_log_service_1 = require("../audit-log/audit-log.service");
let PathaoService = PathaoService_1 = class PathaoService {
    configService;
    tokenModel;
    orderModel;
    settingsModel;
    auditLogService;
    logger = new common_1.Logger(PathaoService_1.name);
    constructor(configService, tokenModel, orderModel, settingsModel, auditLogService) {
        this.configService = configService;
        this.tokenModel = tokenModel;
        this.orderModel = orderModel;
        this.settingsModel = settingsModel;
        this.auditLogService = auditLogService;
    }
    async getBaseUrl() {
        const settings = await this.settingsModel.findOne().exec();
        if (settings && settings.pathaoBaseUrl) {
            return settings.pathaoBaseUrl.replace(/\/$/, '');
        }
        const isSandbox = settings && settings.pathaoSandbox !== undefined && settings.pathaoSandbox !== null
            ? settings.pathaoSandbox
            : this.configService.get('PATHAO_SANDBOX') !== 'false';
        const customUrl = this.configService.get('PATHAO_BASE_URL');
        if (customUrl)
            return customUrl.replace(/\/$/, '');
        return isSandbox
            ? 'https://courier-api-sandbox.pathao.com'
            : 'https://api-hermes.pathao.com';
    }
    async getCredentials() {
        const settings = await this.settingsModel.findOne().exec();
        return {
            clientId: settings?.pathaoClientId || this.configService.get('PATHAO_CLIENT_ID') || process.env.PATHAO_CLIENT_ID || '',
            clientSecret: settings?.pathaoClientSecret || this.configService.get('PATHAO_CLIENT_SECRET') || process.env.PATHAO_CLIENT_SECRET || '',
            username: settings?.pathaoUsername || this.configService.get('PATHAO_USERNAME') || process.env.PATHAO_USERNAME || '',
            password: settings?.pathaoPassword || this.configService.get('PATHAO_PASSWORD') || process.env.PATHAO_PASSWORD || '',
        };
    }
    async getValidAccessToken() {
        let tokenDoc = await this.tokenModel.findOne({ key: 'primary' }).exec();
        const now = new Date();
        if (tokenDoc && tokenDoc.accessToken && tokenDoc.expiresAt && tokenDoc.expiresAt.getTime() > now.getTime() + 300000) {
            return tokenDoc.accessToken;
        }
        if (tokenDoc && tokenDoc.refreshToken) {
            try {
                const refreshed = await this.refreshAccessToken(tokenDoc.refreshToken);
                if (refreshed)
                    return refreshed;
            }
            catch (err) {
                this.logger.warn(`Token refresh failed, re-issuing token: ${err.message}`);
            }
        }
        return this.issueNewToken();
    }
    async issueNewToken() {
        const creds = await this.getCredentials();
        if (!creds.clientId || !creds.clientSecret || !creds.username || !creds.password) {
            throw new common_1.BadRequestException('Pathao Merchant credentials (Client ID, Client Secret, Username/Email, Password) are missing or incomplete.');
        }
        const baseUrl = await this.getBaseUrl();
        const url = `${baseUrl}/aladdin/api/v1/issue-token`;
        let res;
        try {
            res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    client_id: creds.clientId,
                    client_secret: creds.clientSecret,
                    username: creds.username,
                    password: creds.password,
                    grant_type: 'password',
                }),
            });
        }
        catch (netErr) {
            this.logger.error(`Pathao issue-token network error: ${netErr.message}`);
            throw new common_1.BadRequestException(`Unable to reach Pathao server (${url}): ${netErr.message}`);
        }
        let data = {};
        try {
            data = await res.json();
        }
        catch (parseErr) {
            throw new common_1.BadRequestException(`Invalid response from Pathao API (HTTP ${res?.status || 'Unknown'})`);
        }
        if (!res.ok || !data.access_token) {
            this.logger.error(`Pathao issue-token error: ${JSON.stringify(data)}`);
            const errorMsg = data.error_description ||
                data.message ||
                data.error ||
                (data.errors ? JSON.stringify(data.errors) : `HTTP ${res.status} Authentication Failed`);
            throw new common_1.BadRequestException(errorMsg);
        }
        const expiresAt = new Date(Date.now() + (data.expires_in || 3600) * 1000);
        await this.tokenModel.findOneAndUpdate({ key: 'primary' }, {
            accessToken: data.access_token,
            refreshToken: data.refresh_token || '',
            tokenType: data.token_type || 'Bearer',
            expiresAt,
        }, { upsert: true, new: true });
        return data.access_token;
    }
    async refreshAccessToken(refreshToken) {
        const creds = await this.getCredentials();
        const baseUrl = await this.getBaseUrl();
        const url = `${baseUrl}/aladdin/api/v1/issue-token`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                client_id: creds.clientId,
                client_secret: creds.clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            }),
        });
        const data = await res.json();
        if (!res.ok || !data.access_token) {
            return null;
        }
        const expiresAt = new Date(Date.now() + (data.expires_in || 3600) * 1000);
        await this.tokenModel.findOneAndUpdate({ key: 'primary' }, {
            accessToken: data.access_token,
            refreshToken: data.refresh_token || refreshToken,
            tokenType: data.token_type || 'Bearer',
            expiresAt,
        }, { upsert: true });
        return data.access_token;
    }
    async getStores() {
        const token = await this.getValidAccessToken();
        const baseUrl = await this.getBaseUrl();
        const url = `${baseUrl}/aladdin/api/v1/stores`;
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        });
        const data = await res.json();
        if (!res.ok) {
            throw new common_1.BadRequestException(data.message || 'Failed to fetch Pathao stores');
        }
        return data.data?.data || data.data || [];
    }
    async getCities() {
        const token = await this.getValidAccessToken();
        const baseUrl = await this.getBaseUrl();
        const url = `${baseUrl}/aladdin/api/v1/city-list`;
        try {
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });
            const data = await res.json();
            if (res.ok && data.data) {
                return data.data?.data || data.data || [];
            }
        }
        catch (e) {
            this.logger.warn(`Failed /city-list, trying fallback country city-list: ${e.message}`);
        }
        const fallbackUrl = `${baseUrl}/aladdin/api/v1/countries/1/city-list`;
        const res2 = await fetch(fallbackUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        });
        const data2 = await res2.json();
        if (!res2.ok) {
            throw new common_1.BadRequestException(data2.message || 'Failed to fetch Pathao cities');
        }
        return data2.data?.data || data2.data || [];
    }
    async getZones(cityId) {
        const token = await this.getValidAccessToken();
        const baseUrl = await this.getBaseUrl();
        const url = `${baseUrl}/aladdin/api/v1/cities/${cityId}/zone-list`;
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        });
        const data = await res.json();
        if (!res.ok) {
            throw new common_1.BadRequestException(data.message || 'Failed to fetch Pathao zones');
        }
        return data.data?.data || data.data || [];
    }
    async getAreas(zoneId) {
        const token = await this.getValidAccessToken();
        const baseUrl = await this.getBaseUrl();
        const url = `${baseUrl}/aladdin/api/v1/zones/${zoneId}/area-list`;
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        });
        const data = await res.json();
        if (!res.ok) {
            throw new common_1.BadRequestException(data.message || 'Failed to fetch Pathao areas');
        }
        return data.data?.data || data.data || [];
    }
    async calculatePricePlan(payload) {
        const token = await this.getValidAccessToken();
        const baseUrl = await this.getBaseUrl();
        const url = `${baseUrl}/aladdin/api/v1/merchant/price-plan`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                store_id: Number(payload.store_id),
                item_type: Number(payload.item_type || 2),
                delivery_type: Number(payload.delivery_type || 48),
                item_weight: Number(payload.item_weight || 0.5),
                recipient_city: Number(payload.recipient_city),
                recipient_zone: Number(payload.recipient_zone),
            }),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new common_1.BadRequestException(data.message || 'Failed to calculate Pathao delivery price');
        }
        return data.data || data;
    }
    async createOrder(orderId, bookingData, actorEmail = 'ADMIN') {
        const order = await this.orderModel.findById(orderId).exec();
        if (!order) {
            throw new common_1.BadRequestException('Order not found');
        }
        if (order.courier?.consignmentId && order.courier?.provider === 'Pathao') {
            throw new common_1.BadRequestException(`Order is already booked with Pathao Consignment ID: ${order.courier.consignmentId}`);
        }
        let amountToCollect = 0;
        if (order.paymentMethod === 'COD') {
            amountToCollect = order.dueAmount !== undefined ? order.dueAmount : order.subtotal;
        }
        else if (order.paymentStatus !== 'PAID') {
            amountToCollect = order.totalAmount;
        }
        const itemDesc = order.items.map((i) => `${i.productName} (${i.sku}) x${i.quantity}`).join(', ');
        const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
        const payload = {
            store_id: Number(bookingData.storeId),
            merchant_order_id: order.orderId,
            recipient_name: order.customerDetails?.name || 'Customer',
            recipient_phone: order.customerDetails?.mobile || '',
            recipient_address: `${order.customerDetails?.address || ''}, ${order.customerDetails?.district || ''}`,
            recipient_city: Number(bookingData.recipientCity),
            recipient_zone: Number(bookingData.recipientZone),
            recipient_area: bookingData.recipientArea ? Number(bookingData.recipientArea) : undefined,
            delivery_type: 48,
            item_type: 2,
            special_instruction: bookingData.specialInstruction || order.notes || 'Handle with care - Luxury Apparel',
            item_quantity: totalQty || 1,
            item_weight: Number(bookingData.itemWeight || 0.5),
            amount_to_collect: amountToCollect,
            item_description: itemDesc.slice(0, 250),
        };
        const token = await this.getValidAccessToken();
        const baseUrl = await this.getBaseUrl();
        const url = `${baseUrl}/aladdin/api/v1/orders`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || (data.type && data.type !== 'success')) {
            this.logger.error(`Pathao order creation error: ${JSON.stringify(data)}`);
            throw new common_1.BadRequestException(data.message || 'Pathao booking rejected by provider');
        }
        const orderData = data.data || {};
        const consignmentId = orderData.consignment_id || orderData.order_id || '';
        const deliveryFee = Number(orderData.delivery_fee || 0);
        const expectedSettlement = Math.max(0, amountToCollect - deliveryFee);
        order.courier = {
            provider: 'Pathao',
            consignmentId,
            trackingUrl: `https://pathao.com/courier/tracking/?consignment_id=${consignmentId}`,
            charge: deliveryFee || order.deliveryCharge || 0,
            deliveryFee,
            amountToCollect,
            storeId: Number(bookingData.storeId),
            pathaoStatus: orderData.order_status || 'Pending',
            bookedAt: new Date(),
            expectedSettlement,
            settlementStatus: order.paymentMethod === 'COD' ? order_schema_1.CourierSettlementStatus.AWAITING_SETTLEMENT : order_schema_1.CourierSettlementStatus.NOT_APPLICABLE,
        };
        order.status = order_schema_1.OrderStatus.COURIER_BOOKED;
        order.timeline.push({
            status: 'COURIER_BOOKED',
            at: new Date(),
            actor: actorEmail,
            note: `Booked with Pathao Consignment #${consignmentId}. COD to collect: ৳${amountToCollect}. Awaiting rider pickup.`,
        });
        await order.save();
        await this.auditLogService.logAction({
            action: 'PATHAO_ORDER_BOOKED',
            entityType: 'Order',
            entityId: order._id.toString(),
            newData: {
                orderId: order.orderId,
                consignmentId,
                amountToCollect,
                deliveryFee,
                expectedSettlement,
                status: order_schema_1.OrderStatus.COURIER_BOOKED,
                actor: actorEmail,
            },
        });
        return {
            success: true,
            consignmentId,
            deliveryFee,
            trackingUrl: order.courier.trackingUrl,
            amountToCollect,
            expectedSettlement,
            order: order,
        };
    }
    async syncConsignmentStatus(orderId, actorEmail = 'ADMIN') {
        const order = await this.orderModel.findById(orderId).exec();
        if (!order || !order.courier?.consignmentId) {
            throw new common_1.BadRequestException('Order does not have a Pathao consignment ID');
        }
        const consignmentId = order.courier.consignmentId;
        const token = await this.getValidAccessToken();
        const baseUrl = await this.getBaseUrl();
        const url = `${baseUrl}/aladdin/api/v1/orders/${consignmentId}/info`;
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        });
        const data = await res.json();
        if (!res.ok) {
            throw new common_1.BadRequestException(data.message || 'Failed to sync Pathao consignment status');
        }
        const info = data.data || {};
        const pathaoStatus = info.order_status || info.status || '';
        if (order.courier) {
            order.courier.pathaoStatus = pathaoStatus;
        }
        const lower = pathaoStatus.toLowerCase().replace(/[\s_-]+/g, '');
        if ((lower.includes('intransit') || lower.includes('pickedup') || lower.includes('pickupcompleted') || lower.includes('ontheway')) &&
            order.status !== order_schema_1.OrderStatus.SHIPPED &&
            order.status !== order_schema_1.OrderStatus.DELIVERED) {
            order.status = order_schema_1.OrderStatus.SHIPPED;
            order.courier.pickedUpAt = order.courier.pickedUpAt || new Date();
            order.timeline.push({
                status: 'SHIPPED',
                at: new Date(),
                actor: 'PATHAO_SYNC',
                note: `Pathao confirmed rider pickup (${pathaoStatus}). Parcel in transit to customer.`,
            });
        }
        else if (lower.includes('delivered') && order.status !== order_schema_1.OrderStatus.DELIVERED) {
            order.status = order_schema_1.OrderStatus.DELIVERED;
            order.courier.deliveredAt = order.courier.deliveredAt || new Date();
            if (order.paymentMethod === 'COD') {
                order.paymentStatus = order_schema_1.PaymentStatus.PAID;
                order.courier.settlementStatus = order_schema_1.CourierSettlementStatus.AWAITING_SETTLEMENT;
            }
            order.timeline.push({
                status: 'DELIVERED',
                at: new Date(),
                actor: 'PATHAO_SYNC',
                note: `Pathao confirmed delivery (${pathaoStatus}). COD collected by courier; settlement pending.`,
            });
        }
        else if ((lower.includes('return') || lower.includes('rto') || lower.includes('failed')) && order.status !== order_schema_1.OrderStatus.RETURNED) {
            order.status = order_schema_1.OrderStatus.RETURNED;
            order.courier.settlementStatus = order_schema_1.CourierSettlementStatus.NOT_APPLICABLE;
            order.timeline.push({
                status: 'RETURNED',
                at: new Date(),
                actor: 'PATHAO_SYNC',
                note: `Pathao reported parcel return (${pathaoStatus}). Restocked into warehouse.`,
            });
        }
        await order.save();
        await this.auditLogService.logAction({
            action: 'PATHAO_STATUS_SYNC',
            entityType: 'Order',
            entityId: order._id.toString(),
            newData: { consignmentId, pathaoStatus, newOrderStatus: order.status, actor: actorEmail },
        });
        return {
            consignmentId,
            pathaoStatus,
            orderStatus: order.status,
            settlementStatus: order.courier?.settlementStatus,
            details: info,
        };
    }
    async createStore(storeData) {
        const token = await this.getValidAccessToken();
        const baseUrl = await this.getBaseUrl();
        const url = `${baseUrl}/aladdin/api/v1/stores`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(storeData),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new common_1.BadRequestException(data.message || 'Failed to create Pathao store');
        }
        return data;
    }
    async createBulkOrder(orders) {
        const token = await this.getValidAccessToken();
        const baseUrl = await this.getBaseUrl();
        const url = `${baseUrl}/aladdin/api/v1/orders/bulk`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json; charset=UTF-8',
                Accept: 'application/json',
            },
            body: JSON.stringify({ orders }),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new common_1.BadRequestException(data.message || 'Failed to create bulk orders in Pathao');
        }
        return data;
    }
    async getConfig() {
        const settings = await this.settingsModel.findOne().exec();
        const creds = await this.getCredentials();
        const tokenDoc = await this.tokenModel.findOne({ key: 'primary' }).exec();
        const now = new Date();
        const isConfigured = Boolean(creds.clientId && creds.clientSecret && creds.username && creds.password);
        const isTokenActive = Boolean(tokenDoc?.accessToken && tokenDoc?.expiresAt && tokenDoc.expiresAt.getTime() > now.getTime());
        const isEnabled = settings?.pathaoEnabled !== false;
        const isSandbox = settings && settings.pathaoSandbox !== undefined && settings.pathaoSandbox !== null
            ? settings.pathaoSandbox
            : this.configService.get('PATHAO_SANDBOX') !== 'false';
        let maskedEmail = 'Not Configured';
        if (creds.username) {
            const parts = creds.username.split('@');
            if (parts.length === 2) {
                const name = parts[0];
                maskedEmail = name.length > 2 ? `${name[0]}****${name.slice(-1)}@${parts[1]}` : `****@${parts[1]}`;
            }
            else {
                maskedEmail = '****' + creds.username.slice(-3);
            }
        }
        let maskedClientId = 'Not Configured';
        if (creds.clientId) {
            maskedClientId = creds.clientId.length > 4 ? `****${creds.clientId.slice(-4)}` : '••••••••';
        }
        let stores = [];
        if (isConfigured && isEnabled) {
            try {
                stores = await this.getStores();
            }
            catch (e) {
                this.logger.warn(`Could not preload stores during getConfig: ${e.message}`);
            }
        }
        return {
            connectionStatus: !isEnabled ? 'Disabled' : (isConfigured && isTokenActive ? 'Connected' : (isConfigured ? 'Connected' : 'Disconnected')),
            mode: isSandbox ? 'SANDBOX' : 'LIVE',
            merchantEmail: maskedEmail,
            clientId: maskedClientId,
            clientSecret: creds.clientSecret ? '••••••••••••' : 'Not Set',
            password: creds.password ? '••••••••••••' : 'Not Set',
            enabled: isEnabled,
            sandbox: isSandbox,
            selectedStoreId: settings?.pathaoDefaultStoreId || (stores.length > 0 ? stores[0].store_id : null),
            selectedStoreName: settings?.pathaoDefaultStoreName || (stores.length > 0 ? stores[0].store_name : ''),
            lastSuccessfulSync: settings?.pathaoLastSyncAt || null,
            tokenStatus: isTokenActive ? 'Active' : (isConfigured ? 'Standby' : 'Inactive'),
            apiHealth: isConfigured && isEnabled ? 'Healthy' : 'Unconfigured',
            hasCredentials: isConfigured,
            stores,
        };
    }
    async updateConfig(payload, actorEmail = 'ADMIN') {
        let settings = await this.settingsModel.findOne().exec();
        if (!settings) {
            settings = await this.settingsModel.create({ storeName: 'AVELORA' });
        }
        if (payload.clientId !== undefined && payload.clientId !== '')
            settings.pathaoClientId = payload.clientId.trim();
        if (payload.clientSecret !== undefined && payload.clientSecret !== '')
            settings.pathaoClientSecret = payload.clientSecret.trim();
        if (payload.username !== undefined && payload.username !== '')
            settings.pathaoUsername = payload.username.trim();
        if (payload.password !== undefined && payload.password !== '')
            settings.pathaoPassword = payload.password.trim();
        if (payload.sandbox !== undefined)
            settings.pathaoSandbox = payload.sandbox;
        if (payload.defaultStoreId !== undefined)
            settings.pathaoDefaultStoreId = payload.defaultStoreId;
        if (payload.defaultStoreName !== undefined)
            settings.pathaoDefaultStoreName = payload.defaultStoreName;
        await settings.save();
        await this.tokenModel.deleteOne({ key: 'primary' }).exec();
        let tokenError = null;
        try {
            await this.issueNewToken();
            settings.pathaoLastSyncAt = new Date();
            await settings.save();
        }
        catch (e) {
            tokenError = e.message;
            this.logger.error(`Pathao issueNewToken verification error: ${e.message}`);
        }
        if (tokenError) {
            throw new common_1.BadRequestException(`Pathao Authentication Failed: ${tokenError}. Please double-check your Merchant Email, Password, Client ID, and Client Secret.`);
        }
        try {
            const stores = await this.getStores();
            if (stores && stores.length > 0 && !settings.pathaoDefaultStoreId) {
                settings.pathaoDefaultStoreId = stores[0].store_id;
                settings.pathaoDefaultStoreName = stores[0].store_name;
                await settings.save();
            }
        }
        catch (storeErr) {
            this.logger.warn(`Could not fetch stores after token issue: ${storeErr.message}`);
        }
        await this.auditLogService.logAction({
            action: 'UPDATE_PATHAO_CONFIG',
            entityType: 'Settings',
            entityId: settings._id.toString(),
            newData: {
                mode: settings.pathaoSandbox ? 'SANDBOX' : 'LIVE',
                defaultStore: settings.pathaoDefaultStoreName,
                actor: actorEmail,
            },
        });
        return {
            success: true,
            message: 'Pathao credentials updated and connected successfully!',
            config: await this.getConfig(),
        };
    }
    async syncStores(actorEmail = 'ADMIN') {
        const stores = await this.getStores();
        const settings = await this.settingsModel.findOne().exec();
        if (settings) {
            settings.pathaoLastSyncAt = new Date();
            if (!settings.pathaoDefaultStoreId && stores.length > 0) {
                settings.pathaoDefaultStoreId = stores[0].store_id;
                settings.pathaoDefaultStoreName = stores[0].store_name;
            }
            await settings.save();
        }
        await this.auditLogService.logAction({
            action: 'SYNC_PATHAO_STORES',
            entityType: 'Courier',
            entityId: 'pathao',
            newData: { count: stores.length, actor: actorEmail },
        });
        return {
            success: true,
            stores,
            lastSyncAt: settings?.pathaoLastSyncAt || new Date(),
        };
    }
    async toggleIntegration(enabled, actorEmail = 'ADMIN') {
        let settings = await this.settingsModel.findOne().exec();
        if (!settings) {
            settings = await this.settingsModel.create({ storeName: 'AVELORA' });
        }
        settings.pathaoEnabled = enabled;
        await settings.save();
        await this.auditLogService.logAction({
            action: enabled ? 'ENABLE_PATHAO_INTEGRATION' : 'DISABLE_PATHAO_INTEGRATION',
            entityType: 'Settings',
            entityId: settings._id.toString(),
            newData: { enabled, actor: actorEmail },
        });
        return {
            success: true,
            enabled,
            message: enabled ? 'Pathao Courier Integration enabled.' : 'Pathao Courier Integration disabled.',
        };
    }
    async setDefaultStore(storeId, storeName, actorEmail = 'ADMIN') {
        let settings = await this.settingsModel.findOne().exec();
        if (!settings) {
            settings = await this.settingsModel.create({ storeName: 'AVELORA' });
        }
        settings.pathaoDefaultStoreId = Number(storeId);
        settings.pathaoDefaultStoreName = storeName;
        await settings.save();
        await this.auditLogService.logAction({
            action: 'SET_PATHAO_DEFAULT_STORE',
            entityType: 'Settings',
            entityId: settings._id.toString(),
            newData: { storeId, storeName, actor: actorEmail },
        });
        return {
            success: true,
            storeId,
            storeName,
        };
    }
    async testConnection() {
        const token = await this.getValidAccessToken();
        const stores = await this.getStores();
        const settings = await this.settingsModel.findOne().exec();
        if (settings) {
            settings.pathaoLastSyncAt = new Date();
            await settings.save();
        }
        return {
            success: true,
            message: `Connection successful! Found ${stores.length} merchant stores.`,
            stores,
            lastSyncAt: settings?.pathaoLastSyncAt || new Date(),
        };
    }
};
exports.PathaoService = PathaoService;
exports.PathaoService = PathaoService = PathaoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)(pathao_token_schema_1.PathaoToken.name)),
    __param(2, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(3, (0, mongoose_1.InjectModel)(settings_schema_1.Settings.name)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        audit_log_service_1.AuditLogService])
], PathaoService);
//# sourceMappingURL=pathao.service.js.map