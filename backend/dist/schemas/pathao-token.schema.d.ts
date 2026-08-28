import { Document } from 'mongoose';
export type PathaoTokenDocument = PathaoToken & Document;
export declare class PathaoToken {
    key: string;
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresAt: Date;
    selectedStore?: {
        store_id: number;
        store_name: string;
        store_address: string;
    };
}
export declare const PathaoTokenSchema: import("mongoose").Schema<PathaoToken, import("mongoose").Model<PathaoToken, any, any, any, any, any, PathaoToken>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PathaoToken, Document<unknown, {}, PathaoToken, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<PathaoToken & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    key?: import("mongoose").SchemaDefinitionProperty<string, PathaoToken, Document<unknown, {}, PathaoToken, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PathaoToken & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    accessToken?: import("mongoose").SchemaDefinitionProperty<string, PathaoToken, Document<unknown, {}, PathaoToken, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PathaoToken & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    refreshToken?: import("mongoose").SchemaDefinitionProperty<string, PathaoToken, Document<unknown, {}, PathaoToken, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PathaoToken & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    tokenType?: import("mongoose").SchemaDefinitionProperty<string, PathaoToken, Document<unknown, {}, PathaoToken, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PathaoToken & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    expiresAt?: import("mongoose").SchemaDefinitionProperty<Date, PathaoToken, Document<unknown, {}, PathaoToken, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PathaoToken & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    selectedStore?: import("mongoose").SchemaDefinitionProperty<{
        store_id: number;
        store_name: string;
        store_address: string;
    }, PathaoToken, Document<unknown, {}, PathaoToken, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PathaoToken & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, PathaoToken>;
