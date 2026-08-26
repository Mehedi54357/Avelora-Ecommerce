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
    }>> | undefined;
    actorId?: import("mongoose").SchemaDefinitionProperty<MongooseSchema.Types.ObjectId | undefined, IdempotencyKey, Document<unknown, {}, IdempotencyKey, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<IdempotencyKey & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    key?: import("mongoose").SchemaDefinitionProperty<string, IdempotencyKey, Document<unknown, {}, IdempotencyKey, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<IdempotencyKey & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    requestHash?: import("mongoose").SchemaDefinitionProperty<string, IdempotencyKey, Document<unknown, {}, IdempotencyKey, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<IdempotencyKey & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    state?: import("mongoose").SchemaDefinitionProperty<string, IdempotencyKey, Document<unknown, {}, IdempotencyKey, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<IdempotencyKey & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    responseStatus?: import("mongoose").SchemaDefinitionProperty<number | undefined, IdempotencyKey, Document<unknown, {}, IdempotencyKey, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<IdempotencyKey & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    responseBody?: import("mongoose").SchemaDefinitionProperty<Record<string, any> | undefined, IdempotencyKey, Document<unknown, {}, IdempotencyKey, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<IdempotencyKey & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    expiresAt?: import("mongoose").SchemaDefinitionProperty<Date, IdempotencyKey, Document<unknown, {}, IdempotencyKey, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<IdempotencyKey & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, IdempotencyKey>;
