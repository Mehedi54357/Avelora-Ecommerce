import { Document, Schema as MongooseSchema } from 'mongoose';
export type IdempotencyKeyDocument = IdempotencyKey & Document;
export declare class IdempotencyKey {
    scope: string;
    actorId?: MongooseSchema.Types.ObjectId;
    key: string;
    requestHash: string;
    state: string;
    responseStatus?: number;
    responseBody?: Record<string, any>;
    expiresAt: Date;
}
export declare const IdempotencyKeySchema: MongooseSchema<IdempotencyKey, import("mongoose").Model<IdempotencyKey, any, any, any, any, any, IdempotencyKey>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, IdempotencyKey, Document<unknown, {}, IdempotencyKey, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<IdempotencyKey & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    scope?: import("mongoose").SchemaDefinitionProperty<string, IdempotencyKey, Document<unknown, {}, IdempotencyKey, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<IdempotencyKey & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    actorId?: import("mongoose").SchemaDefinitionProperty<MongooseSchema.Types.ObjectId, IdempotencyKey, Document<unknown, {}, IdempotencyKey, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<IdempotencyKey & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    key?: import("mongoose").SchemaDefinitionProperty<string, IdempotencyKey, Document<unknown, {}, IdempotencyKey, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<IdempotencyKey & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    requestHash?: import("mongoose").SchemaDefinitionProperty<string, IdempotencyKey, Document<unknown, {}, IdempotencyKey, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<IdempotencyKey & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    state?: import("mongoose").SchemaDefinitionProperty<string, IdempotencyKey, Document<unknown, {}, IdempotencyKey, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<IdempotencyKey & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    responseStatus?: import("mongoose").SchemaDefinitionProperty<number, IdempotencyKey, Document<unknown, {}, IdempotencyKey, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<IdempotencyKey & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    responseBody?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, IdempotencyKey, Document<unknown, {}, IdempotencyKey, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<IdempotencyKey & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    expiresAt?: import("mongoose").SchemaDefinitionProperty<Date, IdempotencyKey, Document<unknown, {}, IdempotencyKey, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<IdempotencyKey & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, IdempotencyKey>;
