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
    orderId?: import("mongoose").SchemaDefinitionProperty<MongooseSchema.Types.ObjectId | undefined, SettlementLine, Document<unknown, {}, SettlementLine, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SettlementLine & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    orderNumber?: import("mongoose").SchemaDefinitionProperty<string, SettlementLine, Document<unknown, {}, SettlementLine, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SettlementLine & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    consignmentId?: import("mongoose").SchemaDefinitionProperty<string, SettlementLine, Document<unknown, {}, SettlementLine, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SettlementLine & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    codCollected?: import("mongoose").SchemaDefinitionProperty<number, SettlementLine, Document<unknown, {}, SettlementLine, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SettlementLine & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    deliveryFee?: import("mongoose").SchemaDefinitionProperty<number, SettlementLine, Document<unknown, {}, SettlementLine, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SettlementLine & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    returnFee?: import("mongoose").SchemaDefinitionProperty<number, SettlementLine, Document<unknown, {}, SettlementLine, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SettlementLine & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    adjustmentFee?: import("mongoose").SchemaDefinitionProperty<number, SettlementLine, Document<unknown, {}, SettlementLine, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SettlementLine & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    netRemitted?: import("mongoose").SchemaDefinitionProperty<number, SettlementLine, Document<unknown, {}, SettlementLine, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SettlementLine & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<SettlementStatus, SettlementLine, Document<unknown, {}, SettlementLine, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SettlementLine & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    discrepancyNote?: import("mongoose").SchemaDefinitionProperty<string | undefined, SettlementLine, Document<unknown, {}, SettlementLine, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SettlementLine & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
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
    }>> | undefined;
    settlementBatchId?: import("mongoose").SchemaDefinitionProperty<string, CourierSettlement, Document<unknown, {}, CourierSettlement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourierSettlement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    lines?: import("mongoose").SchemaDefinitionProperty<SettlementLine[], CourierSettlement, Document<unknown, {}, CourierSettlement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourierSettlement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    totalCodCollected?: import("mongoose").SchemaDefinitionProperty<number, CourierSettlement, Document<unknown, {}, CourierSettlement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourierSettlement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    totalFeesDeducted?: import("mongoose").SchemaDefinitionProperty<number, CourierSettlement, Document<unknown, {}, CourierSettlement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourierSettlement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    totalNetRemitted?: import("mongoose").SchemaDefinitionProperty<number, CourierSettlement, Document<unknown, {}, CourierSettlement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourierSettlement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    settledAt?: import("mongoose").SchemaDefinitionProperty<Date, CourierSettlement, Document<unknown, {}, CourierSettlement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourierSettlement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    overallStatus?: import("mongoose").SchemaDefinitionProperty<string, CourierSettlement, Document<unknown, {}, CourierSettlement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourierSettlement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    bankDepositReference?: import("mongoose").SchemaDefinitionProperty<string | undefined, CourierSettlement, Document<unknown, {}, CourierSettlement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourierSettlement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    notes?: import("mongoose").SchemaDefinitionProperty<string | undefined, CourierSettlement, Document<unknown, {}, CourierSettlement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourierSettlement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    reconciledBy?: import("mongoose").SchemaDefinitionProperty<string | undefined, CourierSettlement, Document<unknown, {}, CourierSettlement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourierSettlement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, CourierSettlement>;
