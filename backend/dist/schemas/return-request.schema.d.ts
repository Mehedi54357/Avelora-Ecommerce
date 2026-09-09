import { Document, Schema as MongooseSchema } from 'mongoose';
export type ReturnRequestDocument = ReturnRequest & Document;
export declare enum ReturnStatus {
    PENDING_REVIEW = "PENDING_REVIEW",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    ITEM_RECEIVED = "ITEM_RECEIVED",
    INSPECTED_RESTOCKED = "INSPECTED_RESTOCKED",
    INSPECTED_DAMAGED = "INSPECTED_DAMAGED",
    REFUNDED = "REFUNDED"
}
export declare class ReturnRequest {
    orderId: MongooseSchema.Types.ObjectId;
    orderReferenceId: string;
    customerId?: MongooseSchema.Types.ObjectId;
    items: Array<{
        productId: MongooseSchema.Types.ObjectId;
        sku: string;
        variant: string;
        quantity: number;
        unitPrice: number;
        restockable: boolean;
    }>;
    reason: string;
    status: ReturnStatus;
    refundAmount: number;
    refundMethod: string;
    refundTransactionId?: string;
    inspectedBy?: MongooseSchema.Types.ObjectId;
    inspectionNotes?: string;
    receivedAt?: Date;
    refundedAt?: Date;
}
export declare const ReturnRequestSchema: MongooseSchema<ReturnRequest, import("mongoose").Model<ReturnRequest, any, any, any, any, any, ReturnRequest>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ReturnRequest, Document<unknown, {}, ReturnRequest, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ReturnRequest & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    orderId?: import("mongoose").SchemaDefinitionProperty<MongooseSchema.Types.ObjectId, ReturnRequest, Document<unknown, {}, ReturnRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ReturnRequest & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    orderReferenceId?: import("mongoose").SchemaDefinitionProperty<string, ReturnRequest, Document<unknown, {}, ReturnRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ReturnRequest & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    customerId?: import("mongoose").SchemaDefinitionProperty<MongooseSchema.Types.ObjectId, ReturnRequest, Document<unknown, {}, ReturnRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ReturnRequest & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    items?: import("mongoose").SchemaDefinitionProperty<{
        productId: MongooseSchema.Types.ObjectId;
        sku: string;
        variant: string;
        quantity: number;
        unitPrice: number;
        restockable: boolean;
    }[], ReturnRequest, Document<unknown, {}, ReturnRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ReturnRequest & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    reason?: import("mongoose").SchemaDefinitionProperty<string, ReturnRequest, Document<unknown, {}, ReturnRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ReturnRequest & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    status?: import("mongoose").SchemaDefinitionProperty<ReturnStatus, ReturnRequest, Document<unknown, {}, ReturnRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ReturnRequest & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    refundAmount?: import("mongoose").SchemaDefinitionProperty<number, ReturnRequest, Document<unknown, {}, ReturnRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ReturnRequest & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    refundMethod?: import("mongoose").SchemaDefinitionProperty<string, ReturnRequest, Document<unknown, {}, ReturnRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ReturnRequest & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    refundTransactionId?: import("mongoose").SchemaDefinitionProperty<string, ReturnRequest, Document<unknown, {}, ReturnRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ReturnRequest & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    inspectedBy?: import("mongoose").SchemaDefinitionProperty<MongooseSchema.Types.ObjectId, ReturnRequest, Document<unknown, {}, ReturnRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ReturnRequest & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    inspectionNotes?: import("mongoose").SchemaDefinitionProperty<string, ReturnRequest, Document<unknown, {}, ReturnRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ReturnRequest & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    receivedAt?: import("mongoose").SchemaDefinitionProperty<Date, ReturnRequest, Document<unknown, {}, ReturnRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ReturnRequest & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    refundedAt?: import("mongoose").SchemaDefinitionProperty<Date, ReturnRequest, Document<unknown, {}, ReturnRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ReturnRequest & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, ReturnRequest>;
