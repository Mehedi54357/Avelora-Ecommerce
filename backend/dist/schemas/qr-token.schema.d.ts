import { Document, Schema as MongooseSchema } from 'mongoose';
export type QrTokenDocument = QrToken & Document;
export declare enum QrPurpose {
    FULFILL_SHIPMENT = "FULFILL_SHIPMENT",
    ORDER_TRACK = "ORDER_TRACK",
    PRODUCT_RESOLVE = "PRODUCT_RESOLVE",
    INVENTORY_LOOKUP = "INVENTORY_LOOKUP",
    RETURN_RECEIVE = "RETURN_RECEIVE"
}
export declare enum QrTokenStatus {
    ACTIVE = "ACTIVE",
    CONSUMED = "CONSUMED",
    REVOKED = "REVOKED",
    EXPIRED = "EXPIRED"
}
export declare class QrToken {
    tokenHash: string;
    entityType: string;
    entityId: MongooseSchema.Types.ObjectId;
    purpose: QrPurpose;
    status: QrTokenStatus;
    oneTime: boolean;
    issuedBy?: MongooseSchema.Types.ObjectId;
    issuedAt: Date;
    expiresAt: Date;
    consumedAt?: Date;
    consumedBy?: MongooseSchema.Types.ObjectId;
    revokedAt?: Date;
    revokedBy?: MongooseSchema.Types.ObjectId;
    metadata?: Record<string, any>;
}
export declare const QrTokenSchema: MongooseSchema<QrToken, import("mongoose").Model<QrToken, any, any, any, any, any, QrToken>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, QrToken, Document<unknown, {}, QrToken, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<QrToken & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    tokenHash?: import("mongoose").SchemaDefinitionProperty<string, QrToken, Document<unknown, {}, QrToken, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrToken & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    entityType?: import("mongoose").SchemaDefinitionProperty<string, QrToken, Document<unknown, {}, QrToken, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrToken & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    entityId?: import("mongoose").SchemaDefinitionProperty<MongooseSchema.Types.ObjectId, QrToken, Document<unknown, {}, QrToken, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrToken & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    purpose?: import("mongoose").SchemaDefinitionProperty<QrPurpose, QrToken, Document<unknown, {}, QrToken, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrToken & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<QrTokenStatus, QrToken, Document<unknown, {}, QrToken, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrToken & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    oneTime?: import("mongoose").SchemaDefinitionProperty<boolean, QrToken, Document<unknown, {}, QrToken, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrToken & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    issuedBy?: import("mongoose").SchemaDefinitionProperty<MongooseSchema.Types.ObjectId | undefined, QrToken, Document<unknown, {}, QrToken, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrToken & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    issuedAt?: import("mongoose").SchemaDefinitionProperty<Date, QrToken, Document<unknown, {}, QrToken, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrToken & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    expiresAt?: import("mongoose").SchemaDefinitionProperty<Date, QrToken, Document<unknown, {}, QrToken, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrToken & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    consumedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, QrToken, Document<unknown, {}, QrToken, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrToken & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    consumedBy?: import("mongoose").SchemaDefinitionProperty<MongooseSchema.Types.ObjectId | undefined, QrToken, Document<unknown, {}, QrToken, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrToken & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    revokedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, QrToken, Document<unknown, {}, QrToken, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrToken & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    revokedBy?: import("mongoose").SchemaDefinitionProperty<MongooseSchema.Types.ObjectId | undefined, QrToken, Document<unknown, {}, QrToken, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrToken & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    metadata?: import("mongoose").SchemaDefinitionProperty<Record<string, any> | undefined, QrToken, Document<unknown, {}, QrToken, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrToken & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, QrToken>;
