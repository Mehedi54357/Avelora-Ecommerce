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
let OrdersService = OrdersService_1 = class OrdersService {
    orderModel;
    productModel;
    customerModel;
    paymentModel;
    inventoryService;
    couponsService;
    settingsService;
    logger = new common_1.Logger(OrdersService_1.name);
    constructor(orderModel, productModel, customerModel, paymentModel, inventoryService, couponsService, settingsService) {
        this.orderModel = orderModel;
        this.productModel = productModel;
        this.customerModel = customerModel;
        this.paymentModel = paymentModel;
        this.inventoryService = inventoryService;
        this.couponsService = couponsService;
        this.settingsService = settingsService;
    }
    async checkout(data) {
        if (!data.items || data.items.length === 0) {
            throw new common_1.BadRequestException('Order must contain at least one item');
        }
        if (!data.customerDetails?.name || !data.customerDetails?.mobile || !data.customerDetails?.address) {
            throw new common_1.BadRequestException('Complete customer details (name, mobile, address) are required');
        }
        const cleanMobile = data.customerDetails.mobile.trim().replace(/[\s-]/g, '');
        const orderItems = [];
        let subtotal = 0;
        let totalDiscount = 0;
        for (const reqItem of data.items) {
            const product = await this.productModel.findById(reqItem.productId).exec();
            if (!product || product.status === 'ARCHIVED') {
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
            const unitPrice = variant.price > 0 ? variant.price : product.salePrice;
            const costPrice = variant.costPrice || 0;
            const discount = product.originalPrice > unitPrice ? product.originalPrice - unitPrice : 0;
            orderItems.push({
                productId: product._id,
                productName: product.name,
                productImage: variant.image || product.images?.[0] || '',
                sku: variant.sku,
                variant: `${variant.color || ''} ${variant.size || ''}`.trim(),
                color: variant.color || '',
                size: variant.size || '',
                quantity: reqItem.quantity,
                unitPrice,
                costPrice,
                discount,
            });
            subtotal += unitPrice * reqItem.quantity;
            totalDiscount += discount * reqItem.quantity;
        }
        let couponDiscount = 0;
        let appliedCouponCode = '';
        if (data.couponCode && data.couponCode.trim()) {
            try {
                const couponResult = await this.couponsService.validateCoupon(data.couponCode, subtotal);
                if (couponResult.valid) {
                    couponDiscount = couponResult.discountAmount;
                    appliedCouponCode = couponResult.code;
                }
            }
            catch (couponErr) {
                this.logger.warn(`Coupon application notice: ${couponErr.message}`);
            }
        }
        const districtName = data.customerDetails.district || 'Dhaka';
        const deliveryCalc = await this.settingsService.calculateDeliveryCharge(districtName, subtotal);
        const deliveryCharge = deliveryCalc.charge;
        const totalAmount = Math.max(0, subtotal - couponDiscount + deliveryCharge);
        const paymentMethod = data.paymentMethod || 'COD';
        const paymentProvider = data.paymentProvider || (paymentMethod === 'COD' ? 'bKash' : paymentMethod);
        const senderMobile = data.senderMobile || '';
        const transactionId = data.transactionId || '';
        let paidAmount = 0;
        let dueAmount = totalAmount;
        let isAdvancePaid = false;
        if (paymentMethod === 'COD') {
            paidAmount = data.paidAmount !== undefined ? data.paidAmount : (transactionId ? deliveryCharge : 0);
            dueAmount = Math.max(0, totalAmount - paidAmount);
            isAdvancePaid = Boolean(transactionId || senderMobile || paidAmount > 0);
        }
        else {
            paidAmount = data.paidAmount !== undefined ? data.paidAmount : totalAmount;
            dueAmount = Math.max(0, totalAmount - paidAmount);
            isAdvancePaid = true;
        }
        const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.floor(10000 + Math.random() * 90000);
        const orderId = `AVE-${todayStr}-${randomSuffix}`;
        for (const item of orderItems) {
            await this.inventoryService.reserveStock(item.productId.toString(), item.sku, item.quantity, orderId);
        }
        let customer = null;
        try {
            customer = await this.customerModel.findOne({ mobile: cleanMobile }).exec();
            if (!customer) {
                customer = await this.customerModel.create({
                    name: data.customerDetails.name,
                    mobile: cleanMobile,
                    addresses: [
                        {
                            district: data.customerDetails.district || 'Dhaka',
                            area: data.customerDetails.upazila || '',
                            fullAddress: data.customerDetails.address,
                        },
                    ],
                    totalOrders: 1,
                    totalSpent: totalAmount,
                    isGuest: true,
                });
            }
            else {
                customer.totalOrders = (customer.totalOrders || 0) + 1;
                customer.totalSpent = (customer.totalSpent || 0) + totalAmount;
                await customer.save();
            }
        }
        catch (custErr) {
            this.logger.warn(`Non-critical customer profile update notice: ${custErr.message}`);
        }
        const initialTimeline = [
            {
                status: order_schema_1.OrderStatus.PENDING,
                at: new Date(),
                actor: 'CUSTOMER',
                note: `Order placed via Storefront Checkout. ${isAdvancePaid ? `Advance paid: ৳${paidAmount}` : 'Cash on Delivery'}`,
            },
        ];
        const orderDoc = {
            orderId,
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
            paymentStatus: isAdvancePaid && paidAmount >= totalAmount ? order_schema_1.PaymentStatus.PAID : (isAdvancePaid ? order_schema_1.PaymentStatus.PENDING : order_schema_1.PaymentStatus.UNPAID),
            fulfillmentStatus: order_schema_1.FulfillmentStatus.UNFULFILLED,
            paymentMethod,
            paymentProvider,
            paidAmount,
            dueAmount,
            senderMobile,
            transactionId,
            isAdvancePaid,
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
        try {
            await this.paymentModel.create({
                orderId: order._id,
                transactionId: transactionId || `TXN-${orderId}-${Date.now()}`,
                method: paymentMethod,
                provider: paymentProvider,
                amount: paidAmount > 0 ? paidAmount : totalAmount,
                status: paidAmount >= totalAmount ? 'PAID' : (paidAmount > 0 ? 'PARTIAL' : 'PENDING'),
            });
        }
        catch (payErr) {
            this.logger.warn(`Payment transaction log notice: ${payErr.message}`);
        }
        if (appliedCouponCode) {
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
        if (query.search) {
            filter.$or = [
                { orderId: { $regex: query.search, $options: 'i' } },
                { 'customerDetails.name': { $regex: query.search, $options: 'i' } },
                { 'customerDetails.mobile': { $regex: query.search, $options: 'i' } },
                { transactionId: { $regex: query.search, $options: 'i' } },
            ];
        }
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.max(1, Math.min(200, Number(query.limit) || 100));
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
                totalPages: Math.ceil(total / limit),
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
            if (order.paymentMethod === 'COD') {
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
        settings_service_1.SettingsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map