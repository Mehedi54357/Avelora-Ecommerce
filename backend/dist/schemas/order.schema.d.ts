import { Document, Schema as MongooseSchema } from 'mongoose';
export type OrderDocument = Order & Document;
export declare enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    PROCESSING = "PROCESSING",
    PACKED = "PACKED",
    COURIER_BOOKED = "COURIER_BOOKED",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    RETURN_REQUESTED = "RETURN_REQUESTED",
    RETURNED = "RETURNED",
    REFUNDED = "REFUNDED"
}
export declare enum PaymentStatus {
    UNPAID = "UNPAID",
    PENDING = "PENDING",
    PARTIALLY_PAID = "PARTIALLY_PAID",
    PAID = "PAID",
    PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED",
    REFUNDED = "REFUNDED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
}
export declare enum CourierSettlementStatus {
    NOT_APPLICABLE = "NOT_APPLICABLE",
    AWAITING_SETTLEMENT = "AWAITING_SETTLEMENT",
    PARTIALLY_SETTLED = "PARTIALLY_SETTLED",
    SETTLED = "SETTLED",
    DISPUTED = "DISPUTED"
}
export declare enum FulfillmentStatus {
    UNFULFILLED = "UNFULFILLED",
    PROCESSING = "PROCESSING",
    PACKED = "PACKED",
    COURIER_BOOKED = "COURIER_BOOKED",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    RETURNED = "RETURNED"
}
export declare class OrderItem {
    productId: MongooseSchema.Types.ObjectId;
    productName: string;
    productImage: string;
    sku: string;
    variant: string;
    color: string;
    size: string;
    quantity: number;
    unitPrice: number;
    costPrice: number;
    discount: number;
}
export declare const OrderItemSchema: MongooseSchema<OrderItem, import("mongoose").Model<OrderItem, any, any, any, any, any, OrderItem>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, OrderItem, Document<unknown, {}, OrderItem, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<OrderItem & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    productId?: import("mongoose").SchemaDefinitionProperty<MongooseSchema.Types.ObjectId, OrderItem, Document<unknown, {}, OrderItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    productName?: import("mongoose").SchemaDefinitionProperty<string, OrderItem, Document<unknown, {}, OrderItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    productImage?: import("mongoose").SchemaDefinitionProperty<string, OrderItem, Document<unknown, {}, OrderItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    sku?: import("mongoose").SchemaDefinitionProperty<string, OrderItem, Document<unknown, {}, OrderItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    variant?: import("mongoose").SchemaDefinitionProperty<string, OrderItem, Document<unknown, {}, OrderItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    color?: import("mongoose").SchemaDefinitionProperty<string, OrderItem, Document<unknown, {}, OrderItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    size?: import("mongoose").SchemaDefinitionProperty<string, OrderItem, Document<unknown, {}, OrderItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    quantity?: import("mongoose").SchemaDefinitionProperty<number, OrderItem, Document<unknown, {}, OrderItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    unitPrice?: import("mongoose").SchemaDefinitionProperty<number, OrderItem, Document<unknown, {}, OrderItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    costPrice?: import("mongoose").SchemaDefinitionProperty<number, OrderItem, Document<unknown, {}, OrderItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    discount?: import("mongoose").SchemaDefinitionProperty<number, OrderItem, Document<unknown, {}, OrderItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, OrderItem>;
export declare class CustomerDetailsSnapshot {
    name: string;
    mobile: string;
    altMobile?: string;
    address: string;
    division?: string;
    district: string;
    upazila?: string;
    union?: string;
}
export declare const CustomerDetailsSnapshotSchema: MongooseSchema<CustomerDetailsSnapshot, import("mongoose").Model<CustomerDetailsSnapshot, any, any, any, any, any, CustomerDetailsSnapshot>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CustomerDetailsSnapshot, Document<unknown, {}, CustomerDetailsSnapshot, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<CustomerDetailsSnapshot & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    name?: import("mongoose").SchemaDefinitionProperty<string, CustomerDetailsSnapshot, Document<unknown, {}, CustomerDetailsSnapshot, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CustomerDetailsSnapshot & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    mobile?: import("mongoose").SchemaDefinitionProperty<string, CustomerDetailsSnapshot, Document<unknown, {}, CustomerDetailsSnapshot, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CustomerDetailsSnapshot & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    altMobile?: import("mongoose").SchemaDefinitionProperty<string, CustomerDetailsSnapshot, Document<unknown, {}, CustomerDetailsSnapshot, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CustomerDetailsSnapshot & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    address?: import("mongoose").SchemaDefinitionProperty<string, CustomerDetailsSnapshot, Document<unknown, {}, CustomerDetailsSnapshot, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CustomerDetailsSnapshot & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    division?: import("mongoose").SchemaDefinitionProperty<string, CustomerDetailsSnapshot, Document<unknown, {}, CustomerDetailsSnapshot, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CustomerDetailsSnapshot & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    district?: import("mongoose").SchemaDefinitionProperty<string, CustomerDetailsSnapshot, Document<unknown, {}, CustomerDetailsSnapshot, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CustomerDetailsSnapshot & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    upazila?: import("mongoose").SchemaDefinitionProperty<string, CustomerDetailsSnapshot, Document<unknown, {}, CustomerDetailsSnapshot, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CustomerDetailsSnapshot & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    union?: import("mongoose").SchemaDefinitionProperty<string, CustomerDetailsSnapshot, Document<unknown, {}, CustomerDetailsSnapshot, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CustomerDetailsSnapshot & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, CustomerDetailsSnapshot>;
export declare class OrderTimelineEntry {
    status: string;
    at: Date;
    actor?: string;
    note?: string;
}
export declare const OrderTimelineEntrySchema: MongooseSchema<OrderTimelineEntry, import("mongoose").Model<OrderTimelineEntry, any, any, any, any, any, OrderTimelineEntry>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, OrderTimelineEntry, Document<unknown, {}, OrderTimelineEntry, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<OrderTimelineEntry & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    status?: import("mongoose").SchemaDefinitionProperty<string, OrderTimelineEntry, Document<unknown, {}, OrderTimelineEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderTimelineEntry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    at?: import("mongoose").SchemaDefinitionProperty<Date, OrderTimelineEntry, Document<unknown, {}, OrderTimelineEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderTimelineEntry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    actor?: import("mongoose").SchemaDefinitionProperty<string, OrderTimelineEntry, Document<unknown, {}, OrderTimelineEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderTimelineEntry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    note?: import("mongoose").SchemaDefinitionProperty<string, OrderTimelineEntry, Document<unknown, {}, OrderTimelineEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderTimelineEntry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, OrderTimelineEntry>;
export declare class Order {
    orderId: string;
    customerId?: MongooseSchema.Types.ObjectId;
    customerDetails: CustomerDetailsSnapshot;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    fulfillmentStatus?: FulfillmentStatus;
    paymentMethod: string;
    paymentProvider?: string;
    paidAmount: number;
    dueAmount: number;
    senderMobile?: string;
    transactionId?: string;
    isAdvancePaid: boolean;
    items: OrderItem[];
    subtotal: number;
    discount: number;
    couponCode?: string;
    couponDiscount?: number;
    deliveryCharge: number;
    totalAmount: number;
    notes?: string;
    timeline: OrderTimelineEntry[];
    courier?: {
        provider: string;
        consignmentId: string;
        trackingUrl: string;
        charge: number;
        deliveryFee?: number;
        returnFee?: number;
        amountToCollect?: number;
        storeId?: number;
        pathaoStatus?: string;
        bookedAt?: Date;
        pickedUpAt?: Date;
        deliveredAt?: Date;
        settlementStatus?: CourierSettlementStatus;
        expectedSettlement?: number;
        actualSettlement?: number;
        settledAt?: Date;
        settlementAccount?: string;
        transactionRef?: string;
        variance?: number;
        settlementNotes?: string;
    };
    qr?: {
        labelVersion: number;
        lastIssuedAt?: Date;
    };
    cancellationReason?: string;
    returnDetails?: {
        reason: string;
        returnedAt?: Date;
        refundAmount?: number;
        restocked?: boolean;
        refundMethod?: string;
    };
}
export declare const OrderSchema: MongooseSchema<Order, import("mongoose").Model<Order, any, any, any, any, any, Order>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Order, Document<unknown, {}, Order, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    orderId?: import("mongoose").SchemaDefinitionProperty<string, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    customerId?: import("mongoose").SchemaDefinitionProperty<MongooseSchema.Types.ObjectId, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    customerDetails?: import("mongoose").SchemaDefinitionProperty<CustomerDetailsSnapshot, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    status?: import("mongoose").SchemaDefinitionProperty<OrderStatus, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    paymentStatus?: import("mongoose").SchemaDefinitionProperty<PaymentStatus, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    fulfillmentStatus?: import("mongoose").SchemaDefinitionProperty<FulfillmentStatus, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    paymentMethod?: import("mongoose").SchemaDefinitionProperty<string, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    paymentProvider?: import("mongoose").SchemaDefinitionProperty<string, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    paidAmount?: import("mongoose").SchemaDefinitionProperty<number, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    dueAmount?: import("mongoose").SchemaDefinitionProperty<number, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    senderMobile?: import("mongoose").SchemaDefinitionProperty<string, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    transactionId?: import("mongoose").SchemaDefinitionProperty<string, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    isAdvancePaid?: import("mongoose").SchemaDefinitionProperty<boolean, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    items?: import("mongoose").SchemaDefinitionProperty<OrderItem[], Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    subtotal?: import("mongoose").SchemaDefinitionProperty<number, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    discount?: import("mongoose").SchemaDefinitionProperty<number, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    couponCode?: import("mongoose").SchemaDefinitionProperty<string, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    couponDiscount?: import("mongoose").SchemaDefinitionProperty<number, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    deliveryCharge?: import("mongoose").SchemaDefinitionProperty<number, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    totalAmount?: import("mongoose").SchemaDefinitionProperty<number, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    notes?: import("mongoose").SchemaDefinitionProperty<string, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    timeline?: import("mongoose").SchemaDefinitionProperty<OrderTimelineEntry[], Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    courier?: import("mongoose").SchemaDefinitionProperty<{
        provider: string;
        consignmentId: string;
        trackingUrl: string;
        charge: number;
        deliveryFee?: number;
        returnFee?: number;
        amountToCollect?: number;
        storeId?: number;
        pathaoStatus?: string;
        bookedAt?: Date;
        pickedUpAt?: Date;
        deliveredAt?: Date;
        settlementStatus?: CourierSettlementStatus;
        expectedSettlement?: number;
        actualSettlement?: number;
        settledAt?: Date;
        settlementAccount?: string;
        transactionRef?: string;
        variance?: number;
        settlementNotes?: string;
    }, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    qr?: import("mongoose").SchemaDefinitionProperty<{
        labelVersion: number;
        lastIssuedAt?: Date;
    }, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    cancellationReason?: import("mongoose").SchemaDefinitionProperty<string, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    returnDetails?: import("mongoose").SchemaDefinitionProperty<{
        reason: string;
        returnedAt?: Date;
        refundAmount?: number;
        restocked?: boolean;
        refundMethod?: string;
    }, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, Order>;
