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
    }>>;
    tokenId?: import("mongoose").SchemaDefinitionProperty<MongooseSchema.Types.ObjectId, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    entityType?: import("mongoose").SchemaDefinitionProperty<string, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    entityId?: import("mongoose").SchemaDefinitionProperty<MongooseSchema.Types.ObjectId, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    actorId?: import("mongoose").SchemaDefinitionProperty<MongooseSchema.Types.ObjectId, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    actorRole?: import("mongoose").SchemaDefinitionProperty<string, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    action?: import("mongoose").SchemaDefinitionProperty<string, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    result?: import("mongoose").SchemaDefinitionProperty<string, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    previousStatus?: import("mongoose").SchemaDefinitionProperty<string, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    newStatus?: import("mongoose").SchemaDefinitionProperty<string, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    source?: import("mongoose").SchemaDefinitionProperty<string, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    idempotencyKey?: import("mongoose").SchemaDefinitionProperty<string, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    clientInfo?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    evidence?: import("mongoose").SchemaDefinitionProperty<{
        provider: string;
        publicId: string;
        url?: string;
        reason?: string;
    }, QrScanEvent, Document<unknown, {}, QrScanEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrScanEvent & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, QrScanEvent>;
