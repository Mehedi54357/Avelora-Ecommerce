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
    }>> | undefined;
    productName?: import("mongoose").SchemaDefinitionProperty<string, PurchaseItem, Document<unknown, {}, PurchaseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    sku?: import("mongoose").SchemaDefinitionProperty<string, PurchaseItem, Document<unknown, {}, PurchaseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    variantName?: import("mongoose").SchemaDefinitionProperty<string, PurchaseItem, Document<unknown, {}, PurchaseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    color?: import("mongoose").SchemaDefinitionProperty<string, PurchaseItem, Document<unknown, {}, PurchaseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    size?: import("mongoose").SchemaDefinitionProperty<string, PurchaseItem, Document<unknown, {}, PurchaseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    quantity?: import("mongoose").SchemaDefinitionProperty<number, PurchaseItem, Document<unknown, {}, PurchaseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    unitCost?: import("mongoose").SchemaDefinitionProperty<number, PurchaseItem, Document<unknown, {}, PurchaseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    totalCost?: import("mongoose").SchemaDefinitionProperty<number, PurchaseItem, Document<unknown, {}, PurchaseItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
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
    }>> | undefined;
    supplierId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    supplierName?: import("mongoose").SchemaDefinitionProperty<string, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    invoiceNumber?: import("mongoose").SchemaDefinitionProperty<string, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    items?: import("mongoose").SchemaDefinitionProperty<PurchaseItem[], PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    subtotalCost?: import("mongoose").SchemaDefinitionProperty<number, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    additionalCost?: import("mongoose").SchemaDefinitionProperty<number, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    totalCost?: import("mongoose").SchemaDefinitionProperty<number, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    paidAmount?: import("mongoose").SchemaDefinitionProperty<number, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    dueAmount?: import("mongoose").SchemaDefinitionProperty<number, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<PurchaseStatus, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    paymentStatus?: import("mongoose").SchemaDefinitionProperty<PurchasePaymentStatus, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    receivedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    receivedBy?: import("mongoose").SchemaDefinitionProperty<string | undefined, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    notes?: import("mongoose").SchemaDefinitionProperty<string | undefined, PurchaseOrder, Document<unknown, {}, PurchaseOrder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PurchaseOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, PurchaseOrder>;
