import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus, PaymentStatus, FulfillmentStatus, FulfillmentMethod } from '../../schemas/order.schema';
import { ProductDocument } from '../../schemas/product.schema';
import { CustomerDocument } from '../../schemas/customer.schema';
import { PaymentDocument } from '../../schemas/payment.schema';
import { InventoryService } from '../inventory/inventory.service';
import { CouponsService } from '../coupons/coupons.service';
import { SettingsService } from '../settings/settings.service';
import { AuditLogService } from '../audit-log/audit-log.service';
export declare class OrdersService {
    private orderModel;
    private productModel;
    private customerModel;
    private paymentModel;
    private readonly inventoryService;
    private readonly couponsService;
    private readonly settingsService;
    private readonly auditLogService;
    private readonly logger;
    constructor(orderModel: Model<OrderDocument>, productModel: Model<ProductDocument>, customerModel: Model<CustomerDocument>, paymentModel: Model<PaymentDocument>, inventoryService: InventoryService, couponsService: CouponsService, settingsService: SettingsService, auditLogService: AuditLogService);
    checkout(data: {
        customerDetails: {
            name: string;
            mobile: string;
            altMobile?: string;
            address: string;
            division?: string;
            district: string;
            upazila?: string;
            union?: string;
        };
        items: Array<{
            productId: string;
            sku: string;
            quantity: number;
        }>;
        paymentMethod?: string;
        paymentProvider?: string;
        senderMobile?: string;
        transactionId?: string;
        paidAmount?: number;
        couponCode?: string;
        notes?: string;
        dataMode?: string;
        fulfillmentMethod?: FulfillmentMethod;
    }): Promise<import("mongoose").Document<unknown, {}, OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    trackOrder(orderId: string, mobile: string): Promise<{
        orderId: string;
        status: OrderStatus;
        paymentStatus: PaymentStatus;
        fulfillmentStatus: FulfillmentStatus;
        fulfillmentMethod: FulfillmentMethod;
        paymentMethod: string;
        createdAt: any;
        customerName: string;
        district: string;
        maskedMobile: string;
        items: {
            productName: string;
            productImage: string;
            variant: string;
            color: string;
            size: string;
            quantity: number;
            unitPrice: number;
        }[];
        subtotal: number;
        discount: number;
        couponDiscount: number;
        deliveryCharge: number;
        totalAmount: number;
        paidAmount: number;
        dueAmount: number;
        courier: {
            provider: string;
            consignmentId: string;
            trackingUrl: string;
        };
        timeline: import("../../schemas/order.schema").OrderTimelineEntry[];
    }>;
    getAdminOrders(query: {
        status?: string;
        paymentStatus?: string;
        fulfillmentMethod?: string;
        dataMode?: string;
        courier?: string;
        dateRange?: string;
        startDate?: string;
        endDate?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        orders: (import("mongoose").Document<unknown, {}, OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getOrderById(id: string): Promise<Order>;
    updateFulfillmentMethod(id: string, method: FulfillmentMethod, actorId?: string, actor?: string): Promise<import("mongoose").Document<unknown, {}, OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    confirmDirectDelivery(id: string, payload: {
        paymentReceived: boolean;
        amount?: number;
        paymentMethod?: string;
        transactionReference?: string;
        account?: string;
        notes?: string;
    }, actorId?: string, actor?: string): Promise<import("mongoose").Document<unknown, {}, OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    confirmCustomerPickup(id: string, payload: {
        paymentReceived: boolean;
        amount?: number;
        paymentMethod?: string;
        transactionReference?: string;
        account?: string;
        notes?: string;
    }, actorId?: string, actor?: string): Promise<import("mongoose").Document<unknown, {}, OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    recordOrderPayment(id: string, payload: {
        amount: number;
        paymentMethod: string;
        transactionReference?: string;
        account?: string;
        notes?: string;
    }, actorId?: string, actor?: string): Promise<import("mongoose").Document<unknown, {}, OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateOrderStatus(id: string, newStatus: OrderStatus, paymentStatus?: PaymentStatus, actor?: string, note?: string): Promise<import("mongoose").Document<unknown, {}, OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updatePaymentDetails(id: string, data: {
        paymentStatus?: PaymentStatus;
        paidAmount?: number;
        dueAmount?: number;
        transactionId?: string;
        senderMobile?: string;
        isAdvancePaid?: boolean;
    }): Promise<import("mongoose").Document<unknown, {}, OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateCourierDetails(id: string, data: {
        provider: string;
        consignmentId: string;
        trackingUrl?: string;
        charge?: number;
    }): Promise<import("mongoose").Document<unknown, {}, OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    processReturn(id: string, data: {
        reason: string;
        refundAmount: number;
        restocked: boolean;
        refundMethod?: string;
        actorId?: string;
    }): Promise<import("mongoose").Document<unknown, {}, OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    resetTestOrder(id: string, actorId?: string, actor?: string): Promise<import("mongoose").Document<unknown, {}, OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    deleteTestOrder(id: string, actorId?: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
