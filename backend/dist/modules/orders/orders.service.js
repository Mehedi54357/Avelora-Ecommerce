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
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_schema_1 = require("../../schemas/order.schema");
const product_schema_1 = require("../../schemas/product.schema");
const customer_schema_1 = require("../../schemas/customer.schema");
const payment_schema_1 = require("../../schemas/payment.schema");
const inventory_service_1 = require("../inventory/inventory.service");
const coupons_service_1 = require("../coupons/coupons.service");
const settings_service_1 = require("../settings/settings.service");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const products_service_1 = require("../products/products.service");
let OrdersService = OrdersService_1 = class OrdersService {
    constructor(orderModel, productModel, customerModel, paymentModel, inventoryService, couponsService, settingsService, auditLogService) {
        this.orderModel = orderModel;
        this.productModel = productModel;
        this.customerModel = customerModel;
        this.paymentModel = paymentModel;
        this.inventoryService = inventoryService;
        this.couponsService = couponsService;
        this.settingsService = settingsService;
        this.auditLogService = auditLogService;
        this.logger = new common_1.Logger(OrdersService_1.name);
    }
    async checkout(data) {
        if (!data.items || data.items.length === 0) {
            throw new common_1.BadRequestException('Order must contain at least one item');
        }
        if (!data.customerDetails?.name || !data.customerDetails?.mobile || !data.customerDetails?.address) {
            throw new common_1.BadRequestException('Complete customer details (name, mobile, address) are required');
        }
        const cleanMobile = data.customerDetails.mobile.trim().replace(/[\s-]/g, '');
        const isTestData = data.dataMode === 'TEST';
        const chosenFulfillment = data.fulfillmentMethod || order_schema_1.FulfillmentMethod.COURIER;
        const orderItems = [];
        let subtotal = 0;
        let totalDiscount = 0;
        for (const reqItem of data.items) {
            const product = await this.productModel.findById(reqItem.productId).exec();
            if (!product || product.status === 'ARCHIVED' || (!isTestData && product.dataMode === 'TEST')) {
                throw new common_1.NotFoundException(`Product not found or unavailable`);
            }
            const variant = product.variants.find((v) => v.sku === reqItem.sku);
            if (!variant) {
                throw new common_1.NotFoundException(`Variant with SKU "${reqItem.sku}" not found for product "${product.name}"`);
            }
            const availableStock = (variant.stockQuantity || 0) - (variant.reservedQuantity || 0);
            if (availableStock < reqItem.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock for "${product.name} (${variant.color || ''} ${variant.size || ''})". Available: ${Math.max(0, availableStock)}, Requested: ${reqItem.quantity}`);
            }
            const pricing = (0, products_service_1.evaluateProductPricing)(product);
            const baseProductPrice = pricing.effectivePrice;
            const unitPrice = variant.price > 0 ? variant.price : baseProductPrice;
            const costPrice = variant.weightedAverageCost || variant.costPrice || 0;
            const discount = pricing.hasDiscount ? pricing.savingAmount : 0;
            const itemTotal = unitPrice * reqItem.quantity;
            subtotal += itemTotal;
            totalDiscount += discount * reqItem.quantity;
            orderItems.push({
                productId: product._id,
                productName: product.name,
                productImage: variant.image || (product.productImages && product.productImages[0]?.url) || (product.images && product.images[0]) || '',
                sku: variant.sku,
                variant: `${variant.color || ''} ${variant.size || ''}`.trim() || 'Standard',
                color: variant.color || '',
                size: variant.size || '',
                quantity: reqItem.quantity,
                unitPrice,
                costPrice,
                discount,
            });
        }
        let couponDiscount = 0;
        let appliedCouponCode = '';
        if (data.couponCode && data.couponCode.trim() !== '') {
            try {
                const couponRes = await this.couponsService.validateCoupon(data.couponCode, subtotal);
                if (couponRes && couponRes.valid && couponRes.discountAmount > 0) {
                    couponDiscount = couponRes.discountAmount;
                    appliedCouponCode = couponRes.code;
                }
            }
            catch (couponErr) {
                this.logger.warn(`Coupon evaluation note: ${couponErr.message}`);
            }
        }
        const districtLower = (data.customerDetails.district || '').trim().toLowerCase();
        const isDhaka = districtLower.includes('dhaka') ||
            districtLower === 'dhaka' ||
            (data.customerDetails.division || '').trim().toLowerCase().includes('dhaka');
        const storeSettings = await this.settingsService.getSettings();
        const deliveryCharge = chosenFulfillment === order_schema_1.FulfillmentMethod.CUSTOMER_PICKUP
            ? 0
            : isDhaka
                ? (storeSettings.defaultDhakaDeliveryCharge || 70)
                : (storeSettings.defaultOutsideDhakaDeliveryCharge || 130);
        const taxableSubtotal = Math.max(0, subtotal - couponDiscount);
        const totalAmount = taxableSubtotal + deliveryCharge;
        const paymentMethod = data.paymentMethod || 'COD';
        const paymentProvider = data.paymentProvider || (paymentMethod === 'COD' ? 'CashOnDelivery' : 'bKash');
        const senderMobile = data.senderMobile ? data.senderMobile.trim() : '';
        const transactionId = data.transactionId ? data.transactionId.trim() : '';
        const paidAmount = Number(data.paidAmount) || 0;
        const isAdvancePaid = paidAmount > 0;
        const dueAmount = Math.max(0, totalAmount - paidAmount);
        const today = new Date();
        const yyyymmdd = today.toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.floor(10000 + Math.random() * 90000);
        const orderId = isTestData
            ? `TST-${yyyymmdd}-${randomSuffix}`
            : `AVE-${yyyymmdd}-${randomSuffix}`;
        for (const item of orderItems) {
            await this.inventoryService.reserveStock(item.productId.toString(), item.sku, item.quantity, orderId);
        }
        let customer = null;
        if (!isTestData) {
            try {
                customer = await this.customerModel.findOne({ mobile: cleanMobile }).exec();
                if (!customer) {
                    customer = await this.customerModel.create({
                        name: data.customerDetails.name,
                        mobile: cleanMobile,
                        email: `${cleanMobile}@customer.avelora.com`,
                        addresses: [
                            {
                                district: data.customerDetails.district || 'Dhaka',
                                area: data.customerDetails.division || 'Dhaka',
                                fullAddress: data.customerDetails.address || '',
                            },
                        ],
                        totalOrders: 1,
                        totalSpent: totalAmount,
                    });
                }
                else {
                    customer.totalOrders = (customer.totalOrders || 0) + 1;
                    customer.totalSpent = (customer.totalSpent || 0) + totalAmount;
                    await customer.save();
                }
            }
            catch (custErr) {
                this.logger.warn(`Customer profile notice: ${custErr.message}`);
            }
        }
        const initialTimeline = [
            {
                status: order_schema_1.OrderStatus.PENDING,
                at: new Date(),
                actor: isTestData ? 'ADMIN_TEST' : 'CUSTOMER',
                note: `Order created (${chosenFulfillment}). ${isAdvancePaid ? `Advance paid: ৳${paidAmount}` : 'Cash on Delivery'}`,
            },
        ];
        const initialPayments = [];
        if (paidAmount > 0) {
            initialPayments.push({
                amount: paidAmount,
                paymentMethod: paymentMethod,
                transactionReference: transactionId,
                account: paymentProvider,
                paymentDate: new Date(),
                recordedBy: isTestData ? 'ADMIN_TEST' : 'STOREFRONT_CHECKOUT',
                notes: 'Advance payment recorded at checkout',
            });
        }
        const orderDoc = {
            orderId,
            dataMode: isTestData ? 'TEST' : 'PRODUCTION',
            fulfillmentMethod: chosenFulfillment,
            courierSettlementStatus: chosenFulfillment === order_schema_1.FulfillmentMethod.COURIER
                ? order_schema_1.CourierSettlementStatus.AWAITING_SETTLEMENT
                : order_schema_1.CourierSettlementStatus.NOT_APPLICABLE,
            customerId: customer?._id || undefined,
            customerDetails: {
                name: data.customerDetails.name,
                mobile: cleanMobile,
                altMobile: data.customerDetails.altMobile || '',
                address: data.customerDetails.address,
                division: data.customerDetails.division || 'Dhaka',
                district: data.customerDetails.district || 'Dhaka',
                upazila: data.customerDetails.upazila || '',
                union: data.customerDetails.union || '',
            },
            status: order_schema_1.OrderStatus.PENDING,
            paymentStatus: paidAmount >= totalAmount ? order_schema_1.PaymentStatus.PAID : (paidAmount > 0 ? order_schema_1.PaymentStatus.PARTIALLY_PAID : order_schema_1.PaymentStatus.UNPAID),
            fulfillmentStatus: order_schema_1.FulfillmentStatus.UNFULFILLED,
            paymentMethod,
            paymentProvider,
            paidAmount,
            dueAmount,
            senderMobile,
            transactionId,
            isAdvancePaid,
            manualPayments: initialPayments,
            items: orderItems,
            subtotal,
            discount: totalDiscount,
            couponCode: appliedCouponCode || undefined,
            couponDiscount: couponDiscount > 0 ? couponDiscount : 0,
            deliveryCharge,
            totalAmount,
            notes: data.notes || '',
            timeline: initialTimeline,
        };
        const order = await this.orderModel.create(orderDoc);
        if (paidAmount > 0) {
            try {
                await this.paymentModel.create({
                    orderId: order._id,
                    transactionId: transactionId || `TXN-${orderId}-${Date.now()}`,
                    method: paymentMethod,
                    provider: paymentProvider,
                    amount: paidAmount,
                    status: paidAmount >= totalAmount ? 'PAID' : 'PARTIAL',
                });
            }
            catch (payErr) {
                this.logger.warn(`Payment transaction log notice: ${payErr.message}`);
            }
        }
        if (appliedCouponCode && !isTestData) {
            await this.couponsService.recordUsage(appliedCouponCode);
        }
        return order;
    }
    async trackOrder(orderId, mobile) {
        if (!orderId?.trim() || !mobile?.trim()) {
            throw new common_1.BadRequestException('Both Order ID and Recipient Mobile Number are required for tracking verification.');
        }
        const cleanOrderId = orderId.trim().toUpperCase();
        const cleanMobile = mobile.trim().replace(/[\s-]/g, '');
        const order = await this.orderModel.findOne({ orderId: cleanOrderId }).exec();
        if (!order) {
            throw new common_1.NotFoundException(`No order found matching Reference ID "${cleanOrderId}".`);
        }
        const orderPhone = order.customerDetails?.mobile?.replace(/[\s-]/g, '');
        if (orderPhone !== cleanMobile && !orderPhone?.endsWith(cleanMobile) && !cleanMobile.endsWith(orderPhone || '')) {
            throw new common_1.UnauthorizedException('The mobile number provided does not match the recipient on this order.');
        }
        const rawPhone = order.customerDetails.mobile;
        const maskedMobile = rawPhone.length >= 11
            ? `${rawPhone.slice(0, 3)}****${rawPhone.slice(-4)}`
            : '01XXXXXXXXX';
        return {
            orderId: order.orderId,
            status: order.status,
            paymentStatus: order.paymentStatus,
            fulfillmentStatus: order.fulfillmentStatus,
            fulfillmentMethod: order.fulfillmentMethod,
            paymentMethod: order.paymentMethod,
            createdAt: order.createdAt,
            customerName: order.customerDetails.name,
            district: order.customerDetails.district,
            maskedMobile,
            items: order.items.map((i) => ({
                productName: i.productName,
                productImage: i.productImage,
                variant: i.variant,
                color: i.color,
                size: i.size,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
            })),
            subtotal: order.subtotal,
            discount: order.discount,
            couponDiscount: order.couponDiscount || 0,
            deliveryCharge: order.deliveryCharge,
            totalAmount: order.totalAmount,
            paidAmount: order.paidAmount,
            dueAmount: order.dueAmount,
            courier: order.courier
                ? {
                    provider: order.courier.provider,
                    consignmentId: order.courier.consignmentId,
                    trackingUrl: order.courier.trackingUrl,
                }
                : null,
            timeline: order.timeline || [],
        };
    }
    async getAdminOrders(query) {
        const filter = {};
        if (query.status && query.status !== 'ALL') {
            filter.status = query.status;
        }
        if (query.paymentStatus && query.paymentStatus !== 'ALL') {
            filter.paymentStatus = query.paymentStatus;
        }
        if (query.fulfillmentMethod && query.fulfillmentMethod !== 'ALL') {
            filter.fulfillmentMethod = query.fulfillmentMethod;
        }
        if (query.dataMode === 'TEST') {
            filter.dataMode = 'TEST';
        }
        else if (query.dataMode === 'ALL') {
        }
        else {
            filter.dataMode = { $ne: 'TEST' };
        }
        if (query.courier && query.courier !== 'ALL') {
            filter['courier.provider'] = { $regex: query.courier, $options: 'i' };
        }
        if (query.dateRange && query.dateRange !== 'ALL') {
            const now = new Date();
            let fromDate = null;
            let toDate = new Date();
            toDate.setHours(23, 59, 59, 999);
            const range = query.dateRange.toUpperCase();
            if (range === 'TODAY') {
                fromDate = new Date();
                fromDate.setHours(0, 0, 0, 0);
            }
            else if (range === 'YESTERDAY') {
                fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                fromDate.setHours(0, 0, 0, 0);
                toDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                toDate.setHours(23, 59, 59, 999);
            }
            else if (range === '7D' || range === '7_DAYS') {
                fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                fromDate.setHours(0, 0, 0, 0);
            }
            else if (range === '30D' || range === '30_DAYS') {
                fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                fromDate.setHours(0, 0, 0, 0);
            }
            else if (range === 'THIS_MONTH') {
                fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
                fromDate.setHours(0, 0, 0, 0);
            }
            else if (range === 'CUSTOM' && query.startDate) {
                fromDate = new Date(query.startDate);
                fromDate.setHours(0, 0, 0, 0);
                if (query.endDate) {
                    toDate = new Date(query.endDate);
                    toDate.setHours(23, 59, 59, 999);
                }
            }
            if (fromDate && !isNaN(fromDate.getTime())) {
                filter.createdAt = { $gte: fromDate, $lte: toDate };
            }
        }
        if (query.search && query.search.trim()) {
            const term = query.search.trim();
            const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const orClauses = [
                { orderId: { $regex: escapedTerm, $options: 'i' } },
                { 'customerDetails.name': { $regex: escapedTerm, $options: 'i' } },
                { 'customerDetails.email': { $regex: escapedTerm, $options: 'i' } },
                { 'customerDetails.mobile': { $regex: escapedTerm, $options: 'i' } },
                { 'customerDetails.altMobile': { $regex: escapedTerm, $options: 'i' } },
                { senderMobile: { $regex: escapedTerm, $options: 'i' } },
                { 'courier.consignmentId': { $regex: escapedTerm, $options: 'i' } },
                { 'courier.transactionRef': { $regex: escapedTerm, $options: 'i' } },
                { transactionId: { $regex: escapedTerm, $options: 'i' } },
                { 'manualPayments.transactionReference': { $regex: escapedTerm, $options: 'i' } },
                { 'items.sku': { $regex: escapedTerm, $options: 'i' } },
                { 'items.productName': { $regex: escapedTerm, $options: 'i' } },
            ];
            const digitsOnly = term.replace(/\D/g, '');
            if (digitsOnly.length >= 3) {
                let clean11 = '';
                if (digitsOnly.startsWith('880') && digitsOnly.length === 13) {
                    clean11 = digitsOnly.slice(2);
                }
                else if (digitsOnly.length === 11 && digitsOnly.startsWith('01')) {
                    clean11 = digitsOnly;
                }
                else if (digitsOnly.length === 10 && digitsOnly.startsWith('1')) {
                    clean11 = `0${digitsOnly}`;
                }
                if (clean11) {
                    const core9 = clean11.slice(2);
                    orClauses.push({ 'customerDetails.mobile': { $regex: clean11, $options: 'i' } }, { 'customerDetails.mobile': { $regex: core9, $options: 'i' } }, { 'customerDetails.altMobile': { $regex: clean11, $options: 'i' } }, { 'customerDetails.altMobile': { $regex: core9, $options: 'i' } }, { senderMobile: { $regex: clean11, $options: 'i' } }, { senderMobile: { $regex: core9, $options: 'i' } });
                }
                else {
                    orClauses.push({ 'customerDetails.mobile': { $regex: digitsOnly, $options: 'i' } }, { 'customerDetails.altMobile': { $regex: digitsOnly, $options: 'i' } }, { senderMobile: { $regex: digitsOnly, $options: 'i' } });
                }
            }
            filter.$or = orClauses;
        }
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.max(1, Math.min(200, Number(query.limit) || 50));
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            this.orderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this.orderModel.countDocuments(filter).exec(),
        ]);
        return {
            orders,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }
    async getOrderById(id) {
        const order = await this.orderModel.findById(id).exec();
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
    async updateFulfillmentMethod(id, method, actorId, actor = 'ADMIN') {
        const order = await this.orderModel.findById(id).exec();
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.courier?.consignmentId) {
            throw new common_1.BadRequestException('This order is already booked with Pathao courier. Cancel courier booking before changing fulfillment method.');
        }
        const oldMethod = order.fulfillmentMethod;
        order.fulfillmentMethod = method;
        if (method !== order_schema_1.FulfillmentMethod.COURIER) {
            order.courierSettlementStatus = order_schema_1.CourierSettlementStatus.NOT_APPLICABLE;
        }
        order.timeline.push({
            status: order.status,
            at: new Date(),
            actor,
            note: `Fulfillment method changed from ${oldMethod} to ${method}`,
        });
        await order.save();
        await this.auditLogService.logAction({
            adminId: actorId,
            action: 'FULFILLMENT_METHOD_CHANGED',
            entityType: 'ORDER',
            entityId: order.orderId,
            oldData: { fulfillmentMethod: oldMethod },
            newData: { fulfillmentMethod: method },
        });
        return order;
    }
    async confirmDirectDelivery(id, payload, actorId, actor = 'ADMIN') {
        const order = await this.orderModel.findById(id).exec();
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const oldStatus = order.status;
        if (oldStatus !== order_schema_1.OrderStatus.DELIVERED) {
            for (const item of order.items) {
                await this.inventoryService.fulfillStock(item.productId.toString(), item.sku, item.quantity, order.orderId);
            }
        }
        order.status = order_schema_1.OrderStatus.DELIVERED;
        order.fulfillmentStatus = order_schema_1.FulfillmentStatus.DELIVERED;
        order.courierSettlementStatus = order_schema_1.CourierSettlementStatus.NOT_APPLICABLE;
        if (payload.paymentReceived && Number(payload.amount) > 0) {
            const payAmount = Number(payload.amount);
            if (!order.manualPayments)
                order.manualPayments = [];
            order.manualPayments.push({
                amount: payAmount,
                paymentMethod: payload.paymentMethod || 'Cash',
                transactionReference: payload.transactionReference || '',
                account: payload.account || 'Cash On Hand',
                paymentDate: new Date(),
                recordedBy: actor,
                notes: payload.notes || 'Direct Delivery Payment',
            });
            order.paidAmount = (order.paidAmount || 0) + payAmount;
            order.dueAmount = Math.max(0, order.totalAmount - order.paidAmount);
            if (order.paidAmount >= order.totalAmount) {
                order.paymentStatus = order_schema_1.PaymentStatus.PAID;
            }
            else {
                order.paymentStatus = order_schema_1.PaymentStatus.PARTIALLY_PAID;
            }
        }
        else {
            order.dueAmount = Math.max(0, order.totalAmount - (order.paidAmount || 0));
            if (order.paidAmount === 0) {
                order.paymentStatus = order_schema_1.PaymentStatus.UNPAID;
            }
            else if (order.paidAmount < order.totalAmount) {
                order.paymentStatus = order_schema_1.PaymentStatus.PARTIALLY_PAID;
            }
        }
        order.timeline.push({
            status: order_schema_1.OrderStatus.DELIVERED,
            at: new Date(),
            actor,
            note: `Direct Hand Delivery confirmed. Payment: ${payload.paymentReceived ? `৳${payload.amount} received (${payload.paymentMethod || 'Cash'})` : 'UNPAID / PENDING'}`,
        });
        await order.save();
        await this.auditLogService.logAction({
            adminId: actorId,
            action: 'DIRECT_DELIVERY_CONFIRMED',
            entityType: 'ORDER',
            entityId: order.orderId,
            newData: {
                paymentReceived: payload.paymentReceived,
                amount: payload.amount,
                paidAmount: order.paidAmount,
                dueAmount: order.dueAmount,
                paymentStatus: order.paymentStatus,
            },
        });
        return order;
    }
    async confirmCustomerPickup(id, payload, actorId, actor = 'ADMIN') {
        const order = await this.orderModel.findById(id).exec();
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const oldStatus = order.status;
        if (oldStatus !== order_schema_1.OrderStatus.DELIVERED) {
            for (const item of order.items) {
                await this.inventoryService.fulfillStock(item.productId.toString(), item.sku, item.quantity, order.orderId);
            }
        }
        order.status = order_schema_1.OrderStatus.DELIVERED;
        order.fulfillmentStatus = order_schema_1.FulfillmentStatus.DELIVERED;
        order.courierSettlementStatus = order_schema_1.CourierSettlementStatus.NOT_APPLICABLE;
        if (payload.paymentReceived && Number(payload.amount) > 0) {
            const payAmount = Number(payload.amount);
            if (!order.manualPayments)
                order.manualPayments = [];
            order.manualPayments.push({
                amount: payAmount,
                paymentMethod: payload.paymentMethod || 'Cash',
                transactionReference: payload.transactionReference || '',
                account: payload.account || 'Cash On Hand',
                paymentDate: new Date(),
                recordedBy: actor,
                notes: payload.notes || 'Customer Pickup Payment',
            });
            order.paidAmount = (order.paidAmount || 0) + payAmount;
            order.dueAmount = Math.max(0, order.totalAmount - order.paidAmount);
            if (order.paidAmount >= order.totalAmount) {
                order.paymentStatus = order_schema_1.PaymentStatus.PAID;
            }
            else {
                order.paymentStatus = order_schema_1.PaymentStatus.PARTIALLY_PAID;
            }
        }
        else {
            order.dueAmount = Math.max(0, order.totalAmount - (order.paidAmount || 0));
            if (order.paidAmount === 0) {
                order.paymentStatus = order_schema_1.PaymentStatus.UNPAID;
            }
            else if (order.paidAmount < order.totalAmount) {
                order.paymentStatus = order_schema_1.PaymentStatus.PARTIALLY_PAID;
            }
        }
        order.timeline.push({
            status: order_schema_1.OrderStatus.DELIVERED,
            at: new Date(),
            actor,
            note: `Customer Pickup completed. Payment: ${payload.paymentReceived ? `৳${payload.amount} received (${payload.paymentMethod || 'Cash'})` : 'UNPAID / PENDING'}`,
        });
        await order.save();
        await this.auditLogService.logAction({
            adminId: actorId,
            action: 'CUSTOMER_PICKUP_CONFIRMED',
            entityType: 'ORDER',
            entityId: order.orderId,
            newData: {
                paymentReceived: payload.paymentReceived,
                amount: payload.amount,
                paidAmount: order.paidAmount,
                dueAmount: order.dueAmount,
                paymentStatus: order.paymentStatus,
            },
        });
        return order;
    }
    async recordOrderPayment(id, payload, actorId, actor = 'ADMIN') {
        const order = await this.orderModel.findById(id).exec();
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const payAmount = Number(payload.amount);
        if (!payAmount || payAmount <= 0) {
            throw new common_1.BadRequestException('Payment amount must be strictly greater than 0.');
        }
        if (!order.manualPayments)
            order.manualPayments = [];
        if (payload.transactionReference && payload.transactionReference.trim()) {
            const isDuplicate = order.manualPayments.some((p) => p.transactionReference === payload.transactionReference?.trim());
            if (isDuplicate) {
                throw new common_1.BadRequestException(`A payment with transaction reference "${payload.transactionReference}" has already been recorded.`);
            }
        }
        order.manualPayments.push({
            amount: payAmount,
            paymentMethod: payload.paymentMethod || 'Cash',
            transactionReference: payload.transactionReference || '',
            account: payload.account || 'Cash On Hand',
            paymentDate: new Date(),
            recordedBy: actor,
            notes: payload.notes || '',
        });
        order.paidAmount = (order.paidAmount || 0) + payAmount;
        order.dueAmount = Math.max(0, order.totalAmount - order.paidAmount);
        if (order.paidAmount >= order.totalAmount) {
            order.paymentStatus = order_schema_1.PaymentStatus.PAID;
        }
        else {
            order.paymentStatus = order_schema_1.PaymentStatus.PARTIALLY_PAID;
        }
        order.timeline.push({
            status: order.status,
            at: new Date(),
            actor,
            note: `Payment of ৳${payAmount} recorded via ${payload.paymentMethod || 'Cash'}. Outstanding Due: ৳${order.dueAmount}`,
        });
        await order.save();
        await this.auditLogService.logAction({
            adminId: actorId,
            action: 'MANUAL_PAYMENT_CONFIRMED',
            entityType: 'ORDER',
            entityId: order.orderId,
            newData: {
                amountAdded: payAmount,
                totalPaid: order.paidAmount,
                totalDue: order.dueAmount,
                paymentStatus: order.paymentStatus,
            },
        });
        return order;
    }
    async updateOrderStatus(id, newStatus, paymentStatus, actor = 'STAFF', note) {
        const order = await this.orderModel.findById(id).exec();
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const oldStatus = order.status;
        if (oldStatus === newStatus) {
            if (paymentStatus) {
                order.paymentStatus = paymentStatus;
                await order.save();
            }
            return order;
        }
        if (newStatus === order_schema_1.OrderStatus.DELIVERED && oldStatus !== order_schema_1.OrderStatus.DELIVERED) {
            for (const item of order.items) {
                await this.inventoryService.fulfillStock(item.productId.toString(), item.sku, item.quantity, order.orderId);
            }
            order.fulfillmentStatus = order_schema_1.FulfillmentStatus.DELIVERED;
            if (order.fulfillmentMethod === order_schema_1.FulfillmentMethod.COURIER && order.paymentMethod === 'COD') {
                order.paymentStatus = order_schema_1.PaymentStatus.PAID;
                order.paidAmount = order.totalAmount;
                order.dueAmount = 0;
            }
        }
        else if (newStatus === order_schema_1.OrderStatus.CANCELLED &&
            oldStatus !== order_schema_1.OrderStatus.CANCELLED &&
            oldStatus !== order_schema_1.OrderStatus.DELIVERED &&
            oldStatus !== order_schema_1.OrderStatus.RETURNED) {
            for (const item of order.items) {
                await this.inventoryService.releaseReservation(item.productId.toString(), item.sku, item.quantity, order.orderId);
            }
            order.cancellationReason = note || 'Cancelled by staff';
        }
        else if (newStatus === order_schema_1.OrderStatus.RETURNED && oldStatus === order_schema_1.OrderStatus.DELIVERED) {
            for (const item of order.items) {
                await this.inventoryService.returnStock(item.productId.toString(), item.sku, item.quantity, order.orderId);
            }
            order.fulfillmentStatus = order_schema_1.FulfillmentStatus.RETURNED;
        }
        else if (newStatus === order_schema_1.OrderStatus.SHIPPED) {
            order.fulfillmentStatus = order_schema_1.FulfillmentStatus.SHIPPED;
        }
        else if (newStatus === order_schema_1.OrderStatus.PACKED) {
            order.fulfillmentStatus = order_schema_1.FulfillmentStatus.PACKED;
        }
        order.status = newStatus;
        if (paymentStatus) {
            order.paymentStatus = paymentStatus;
        }
        order.timeline.push({
            status: newStatus,
            at: new Date(),
            actor,
            note: note || `Order status updated from ${oldStatus} to ${newStatus}`,
        });
        await order.save();
        return order;
    }
    async updatePaymentDetails(id, data) {
        const order = await this.orderModel.findById(id).exec();
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (data.paymentStatus !== undefined)
            order.paymentStatus = data.paymentStatus;
        if (data.paidAmount !== undefined)
            order.paidAmount = data.paidAmount;
        if (data.dueAmount !== undefined)
            order.dueAmount = data.dueAmount;
        if (data.transactionId !== undefined)
            order.transactionId = data.transactionId;
        if (data.senderMobile !== undefined)
            order.senderMobile = data.senderMobile;
        if (data.isAdvancePaid !== undefined)
            order.isAdvancePaid = data.isAdvancePaid;
        await order.save();
        return order;
    }
    async updateCourierDetails(id, data) {
        const order = await this.orderModel.findById(id).exec();
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        order.courier = {
            provider: data.provider,
            consignmentId: data.consignmentId,
            trackingUrl: data.trackingUrl || '',
            charge: data.charge || 0,
            bookedAt: new Date(),
        };
        order.timeline.push({
            status: 'COURIER_BOOKED',
            at: new Date(),
            actor: 'STAFF',
            note: `Booked with ${data.provider}. Consignment ID: ${data.consignmentId}`,
        });
        await order.save();
        return order;
    }
    async processReturn(id, data) {
        const order = await this.orderModel.findById(id).exec();
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (data.restocked && order.status === order_schema_1.OrderStatus.DELIVERED) {
            for (const item of order.items) {
                await this.inventoryService.returnStock(item.productId.toString(), item.sku, item.quantity, order.orderId, data.actorId);
            }
        }
        order.status = order_schema_1.OrderStatus.RETURNED;
        order.fulfillmentStatus = order_schema_1.FulfillmentStatus.RETURNED;
        if (data.refundAmount > 0) {
            order.paymentStatus = data.refundAmount >= order.paidAmount ? order_schema_1.PaymentStatus.REFUNDED : order_schema_1.PaymentStatus.PARTIALLY_REFUNDED;
        }
        order.returnDetails = {
            reason: data.reason,
            returnedAt: new Date(),
            refundAmount: data.refundAmount,
            restocked: data.restocked,
            refundMethod: data.refundMethod || 'bKash',
        };
        order.timeline.push({
            status: order_schema_1.OrderStatus.RETURNED,
            at: new Date(),
            actor: 'STAFF',
            note: `Return processed. Reason: ${data.reason}. Restocked: ${data.restocked ? 'Yes' : 'No'}. Refund: ৳${data.refundAmount}`,
        });
        await order.save();
        return order;
    }
    async resetTestOrder(id, actorId, actor = 'ADMIN') {
        const order = await this.orderModel.findById(id).exec();
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.dataMode !== 'TEST') {
            throw new common_1.BadRequestException('Only verified TEST orders can be reset.');
        }
        for (const item of order.items) {
            await this.inventoryService.releaseReservation(item.productId.toString(), item.sku, item.quantity, order.orderId);
        }
        order.status = order_schema_1.OrderStatus.PENDING;
        order.paymentStatus = order_schema_1.PaymentStatus.UNPAID;
        order.fulfillmentStatus = order_schema_1.FulfillmentStatus.UNFULFILLED;
        order.paidAmount = 0;
        order.dueAmount = order.totalAmount;
        order.manualPayments = [];
        order.timeline.push({
            status: order_schema_1.OrderStatus.PENDING,
            at: new Date(),
            actor,
            note: 'Test order reset to initial state by administrator.',
        });
        await order.save();
        await this.auditLogService.logAction({
            adminId: actorId,
            action: 'TEST_ORDER_RESET',
            entityType: 'ORDER',
            entityId: order.orderId,
        });
        return order;
    }
    async deleteTestOrder(id, actorId) {
        const order = await this.orderModel.findById(id).exec();
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.dataMode !== 'TEST') {
            throw new common_1.BadRequestException('Production orders with financial/inventory history cannot be deleted. Cancel the order instead.');
        }
        for (const item of order.items) {
            await this.inventoryService.releaseReservation(item.productId.toString(), item.sku, item.quantity, order.orderId);
        }
        await this.paymentModel.deleteMany({ orderId: order._id }).exec();
        await this.orderModel.findByIdAndDelete(id).exec();
        await this.auditLogService.logAction({
            adminId: actorId,
            action: 'TEST_ORDER_DELETED',
            entityType: 'ORDER',
            entityId: order.orderId,
            oldData: { orderId: order.orderId, totalAmount: order.totalAmount },
        });
        return { success: true, message: 'Test order safely deleted and reservations released.' };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(2, (0, mongoose_1.InjectModel)(customer_schema_1.Customer.name)),
    __param(3, (0, mongoose_1.InjectModel)(payment_schema_1.Payment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        inventory_service_1.InventoryService,
        coupons_service_1.CouponsService,
        settings_service_1.SettingsService,
        audit_log_service_1.AuditLogService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map