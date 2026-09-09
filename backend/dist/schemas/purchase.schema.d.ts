import { Document, Types } from 'mongoose';
export type PurchaseOrderDocument = PurchaseOrder & Document;
export declare enum PurchaseStatus {
    DRAFT = "DRAFT",
    PENDING = "PENDING",
    RECEIVED = "RECEIVED",
    PARTIAL = "PARTIAL",
    CANCELLED = "CANCELLED"
}
export declare enum PurchasePaymentStatus {
    UNPAID = "UNPAID",
    PARTIALLY_PAID = "PARTIALLY_PAID",
    PAID = "PAID"
}
export declare class PurchaseItem {
    productId: Types.ObjectId;
    productName: string;
    sku: string;
    variantName: string;
    color: string;
    size: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
}
export declare const PurchaseItemSchema: import("mongoose").Schema<PurchaseItem, import("mongoose").Model<PurchaseItem, any, any, any, any, any, PurchaseItem>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PurchaseItem, Document<unknown, {}, PurchaseItem, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseItem & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    productId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, PurchaseItem, Document<unknown, {}, PurchaseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    productName?: import("mongoose").SchemaDefinitionProperty<string, PurchaseItem, Document<unknown, {}, PurchaseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    sku?: import("mongoose").SchemaDefinitionProperty<string, PurchaseItem, Document<unknown, {}, PurchaseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    variantName?: import("mongoose").SchemaDefinitionProperty<string, PurchaseItem, Document<unknown, {}, PurchaseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    color?: import("mongoose").SchemaDefinitionProperty<string, PurchaseItem, Document<unknown, {}, PurchaseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    size?: import("mongoose").SchemaDefinitionProperty<string, PurchaseItem, Document<unknown, {}, PurchaseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    quantity?: import("mongoose").SchemaDefinitionProperty<number, PurchaseItem, Document<unknown, {}, PurchaseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    unitCost?: import("mongoose").SchemaDefinitionProperty<number, PurchaseItem, Document<unknown, {}, PurchaseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    totalCost?: import("mongoose").SchemaDefinitionProperty<number, PurchaseItem, Document<unknown, {}, PurchaseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, PurchaseItem>;
export declare class PurchaseOrder {
    purchaseId: string;
    supplierId: Types.ObjectId;
    supplierName: string;
    invoiceNumber: string;
    items: PurchaseItem[];
    subtotalCost: number;
    additionalCost: number;
    totalCost: number;
    paidAmount: number;
    dueAmount: number;
    status: PurchaseStatus;
    paymentStatus: PurchasePaymentStatus;
    receivedAt?: Date;
    receivedBy?: string;
    notes?: string;
}
export declare const PurchaseOrderSchema: import("mongoose").Schema<PurchaseOrder, import("mongoose").Model<PurchaseOrder, any, any, any, any, any, PurchaseOrder>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    purchaseId?: import("mongoose").SchemaDefinitionProperty<string, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    supplierId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    supplierName?: import("mongoose").SchemaDefinitionProperty<string, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    invoiceNumber?: import("mongoose").SchemaDefinitionProperty<string, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    items?: import("mongoose").SchemaDefinitionProperty<PurchaseItem[], PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    subtotalCost?: import("mongoose").SchemaDefinitionProperty<number, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    additionalCost?: import("mongoose").SchemaDefinitionProperty<number, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    totalCost?: import("mongoose").SchemaDefinitionProperty<number, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    paidAmount?: import("mongoose").SchemaDefinitionProperty<number, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    dueAmount?: import("mongoose").SchemaDefinitionProperty<number, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    status?: import("mongoose").SchemaDefinitionProperty<PurchaseStatus, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    paymentStatus?: import("mongoose").SchemaDefinitionProperty<PurchasePaymentStatus, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    receivedAt?: import("mongoose").SchemaDefinitionProperty<Date, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    receivedBy?: import("mongoose").SchemaDefinitionProperty<string, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    notes?: import("mongoose").SchemaDefinitionProperty<string, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, PurchaseOrder>;
