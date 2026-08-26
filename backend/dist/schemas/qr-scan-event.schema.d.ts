import { Document, Schema as MongooseSchema } from 'mongoose';
export type QrScanEventDocument = QrScanEvent & Document;
export declare class QrScanEvent {
    eventId: string;
    tokenId?: MongooseSchema.Types.ObjectId;
    entityType: string;
    entityId: MongooseSchema.Types.ObjectId;
    actorId?: MongooseSchema.Types.ObjectId;
    actorRole: string;
    action: string;
    result: string;
    previousStatus?: string;
    newStatus?: string;
    source: string;
    idempotencyKey?: string;
    clientInfo?: Record<string, any>;
    evidence?: {
        provider: string;
        publicId: string;
        url?: string;
        reason?: string;
    };
}
export declare const QrScanEventSchema: MongooseSchema<QrScanEvent, import("mongoose").Model<QrScanEvent, any, any, any, any, any, QrScanEvent>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, QrScanEvent, Document<unknown, {}, QrScanEvent, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    eventId?: import("mongoose").SchemaDefinitionProperty<string, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    tokenId?: import("mongoose").SchemaDefinitionProperty<MongooseSchema.Types.ObjectId | undefined, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    entityType?: import("mongoose").SchemaDefinitionProperty<string, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    entityId?: import("mongoose").SchemaDefinitionProperty<MongooseSchema.Types.ObjectId, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    actorId?: import("mongoose").SchemaDefinitionProperty<MongooseSchema.Types.ObjectId | undefined, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    actorRole?: import("mongoose").SchemaDefinitionProperty<string, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    action?: import("mongoose").SchemaDefinitionProperty<string, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    result?: import("mongoose").SchemaDefinitionProperty<string, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    previousStatus?: import("mongoose").SchemaDefinitionProperty<string | undefined, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    newStatus?: import("mongoose").SchemaDefinitionProperty<string | undefined, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    source?: import("mongoose").SchemaDefinitionProperty<string, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    idempotencyKey?: import("mongoose").SchemaDefinitionProperty<string | undefined, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    clientInfo?: import("mongoose").SchemaDefinitionProperty<Record<string, any> | undefined, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    evidence?: import("mongoose").SchemaDefinitionProperty<{
        provider: string;
        publicId: string;
        url?: string;
        reason?: string;
    } | undefined, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, QrScanEvent>;
