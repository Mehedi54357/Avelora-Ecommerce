import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    checkout(body: any): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/order.schema").OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/order.schema").Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    trackOrder(orderId: string, mobile: string): Promise<{
        orderId: string;
        status: import("../../schemas/order.schema").OrderStatus;
        paymentStatus: import("../../schemas/order.schema").PaymentStatus;
        fulfillmentStatus: import("../../schemas/order.schema").FulfillmentStatus | undefined;
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
        } | null;
        timeline: import("../../schemas/order.schema").OrderTimelineEntry[];
    }>;
    getAdminOrders(status?: string, search?: string, page?: number, limit?: number): Promise<{
        orders: (import("mongoose").Document<unknown, {}, import("../../schemas/order.schema").OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/order.schema").Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
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
    getOrderById(id: string): Promise<import("../../schemas/order.schema").Order>;
    updateStatus(id: string, body: {
        status: any;
        paymentStatus?: any;
        note?: string;
    }, req: any): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/order.schema").OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/order.schema").Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updatePaymentDetails(id: string, body: any): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/order.schema").OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/order.schema").Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateCourier(id: string, body: any): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/order.schema").OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/order.schema").Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    processReturn(id: string, body: any, req: any): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/order.schema").OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/order.schema").Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
