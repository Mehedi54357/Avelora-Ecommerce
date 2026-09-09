import { Document, Schema as MongooseSchema } from 'mongoose';
export type CourierSettlementDocument = CourierSettlement & Document;
export declare enum SettlementStatus {
    MATCHED = "MATCHED",
    AMOUNT_MISMATCH = "AMOUNT_MISMATCH",
    MISSING_ORDER = "MISSING_ORDER",
    PENDING = "PENDING"
}
export declare class SettlementLine {
    orderId?: MongooseSchema.Types.ObjectId;
    orderNumber: string;
    consignmentId: string;
    codCollected: number;
    deliveryFee: number;
    returnFee: number;
    adjustmentFee: number;
    netRemitted: number;
    status: SettlementStatus;
    discrepancyNote?: string;
}
export declare const SettlementLineSchema: MongooseSchema<SettlementLine, import("mongoose").Model<SettlementLine, any, any, any, any, any, SettlementLine>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SettlementLine, Document<unknown, {}, SettlementLine, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<SettlementLine & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    orderId?: import("mongoose").SchemaDefinitionProperty<MongooseSchema.Types.ObjectId, SettlementLine, Document<unknown, {}, SettlementLine, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SettlementLine & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    orderNumber?: import("mongoose").SchemaDefinitionProperty<string, SettlementLine, Document<unknown, {}, SettlementLine, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SettlementLine & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    consignmentId?: import("mongoose").SchemaDefinitionProperty<string, SettlementLine, Document<unknown, {}, SettlementLine, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SettlementLine & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    codCollected?: import("mongoose").SchemaDefinitionProperty<number, SettlementLine, Document<unknown, {}, SettlementLine, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SettlementLine & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    deliveryFee?: import("mongoose").SchemaDefinitionProperty<number, SettlementLine, Document<unknown, {}, SettlementLine, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SettlementLine & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    returnFee?: import("mongoose").SchemaDefinitionProperty<number, SettlementLine, Document<unknown, {}, SettlementLine, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SettlementLine & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    adjustmentFee?: import("mongoose").SchemaDefinitionProperty<number, SettlementLine, Document<unknown, {}, SettlementLine, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SettlementLine & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    netRemitted?: import("mongoose").SchemaDefinitionProperty<number, SettlementLine, Document<unknown, {}, SettlementLine, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SettlementLine & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    status?: import("mongoose").SchemaDefinitionProperty<SettlementStatus, SettlementLine, Document<unknown, {}, SettlementLine, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SettlementLine & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    discrepancyNote?: import("mongoose").SchemaDefinitionProperty<string, SettlementLine, Document<unknown, {}, SettlementLine, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SettlementLine & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, SettlementLine>;
export declare class CourierSettlement {
    provider: string;
    settlementBatchId: string;
    lines: SettlementLine[];
    totalCodCollected: number;
    totalFeesDeducted: number;
    totalNetRemitted: number;
    settledAt: Date;
    overallStatus: string;
    bankDepositReference?: string;
    notes?: string;
    reconciledBy?: string;
}
export declare const CourierSettlementSchema: MongooseSchema<CourierSettlement, import("mongoose").Model<CourierSettlement, any, any, any, any, any, CourierSettlement>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CourierSettlement, Document<unknown, {}, CourierSettlement, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<CourierSettlement & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    provider?: import("mongoose").SchemaDefinitionProperty<string, CourierSettlement, Document<unknown, {}, CourierSettlement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourierSettlement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    settlementBatchId?: import("mongoose").SchemaDefinitionProperty<string, CourierSettlement, Document<unknown, {}, CourierSettlement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourierSettlement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    lines?: import("mongoose").SchemaDefinitionProperty<SettlementLine[], CourierSettlement, Document<unknown, {}, CourierSettlement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourierSettlement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    totalCodCollected?: import("mongoose").SchemaDefinitionProperty<number, CourierSettlement, Document<unknown, {}, CourierSettlement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourierSettlement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    totalFeesDeducted?: import("mongoose").SchemaDefinitionProperty<number, CourierSettlement, Document<unknown, {}, CourierSettlement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourierSettlement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    totalNetRemitted?: import("mongoose").SchemaDefinitionProperty<number, CourierSettlement, Document<unknown, {}, CourierSettlement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourierSettlement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    settledAt?: import("mongoose").SchemaDefinitionProperty<Date, CourierSettlement, Document<unknown, {}, CourierSettlement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourierSettlement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    overallStatus?: import("mongoose").SchemaDefinitionProperty<string, CourierSettlement, Document<unknown, {}, CourierSettlement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourierSettlement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    bankDepositReference?: import("mongoose").SchemaDefinitionProperty<string, CourierSettlement, Document<unknown, {}, CourierSettlement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourierSettlement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    notes?: import("mongoose").SchemaDefinitionProperty<string, CourierSettlement, Document<unknown, {}, CourierSettlement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourierSettlement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    reconciledBy?: import("mongoose").SchemaDefinitionProperty<string, CourierSettlement, Document<unknown, {}, CourierSettlement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourierSettlement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, CourierSettlement>;
