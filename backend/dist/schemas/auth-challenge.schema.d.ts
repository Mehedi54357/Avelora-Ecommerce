import { Document, Types, Schema as MongooseSchema } from 'mongoose';
export type AuthChallengeDocument = AuthChallenge & Document;
export declare enum ChallengePurpose {
    ADMIN_LOGIN_OTP = "ADMIN_LOGIN_OTP",
    PASSWORD_RESET = "PASSWORD_RESET"
}
export declare class AuthChallenge {
    challengeId: string;
    userId: Types.ObjectId;
    email: string;
    otpHash: string;
    purpose: ChallengePurpose;
    expiresAt: Date;
    attempts: number;
    maxAttempts: number;
    resendAvailableAt: Date;
    isConsumed: boolean;
    consumedAt?: Date;
    ipAddress?: string;
    userAgent?: string;
}
export declare const AuthChallengeSchema: MongooseSchema<AuthChallenge, import("mongoose").Model<AuthChallenge, any, any, any, any, any, AuthChallenge>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AuthChallenge, Document<unknown, {}, AuthChallenge, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<AuthChallenge & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    challengeId?: import("mongoose").SchemaDefinitionProperty<string, AuthChallenge, Document<unknown, {}, AuthChallenge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AuthChallenge & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    userId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, AuthChallenge, Document<unknown, {}, AuthChallenge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AuthChallenge & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    email?: import("mongoose").SchemaDefinitionProperty<string, AuthChallenge, Document<unknown, {}, AuthChallenge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AuthChallenge & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    otpHash?: import("mongoose").SchemaDefinitionProperty<string, AuthChallenge, Document<unknown, {}, AuthChallenge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AuthChallenge & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    purpose?: import("mongoose").SchemaDefinitionProperty<ChallengePurpose, AuthChallenge, Document<unknown, {}, AuthChallenge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AuthChallenge & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    expiresAt?: import("mongoose").SchemaDefinitionProperty<Date, AuthChallenge, Document<unknown, {}, AuthChallenge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AuthChallenge & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    attempts?: import("mongoose").SchemaDefinitionProperty<number, AuthChallenge, Document<unknown, {}, AuthChallenge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AuthChallenge & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    maxAttempts?: import("mongoose").SchemaDefinitionProperty<number, AuthChallenge, Document<unknown, {}, AuthChallenge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AuthChallenge & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    resendAvailableAt?: import("mongoose").SchemaDefinitionProperty<Date, AuthChallenge, Document<unknown, {}, AuthChallenge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AuthChallenge & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    isConsumed?: import("mongoose").SchemaDefinitionProperty<boolean, AuthChallenge, Document<unknown, {}, AuthChallenge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AuthChallenge & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    consumedAt?: import("mongoose").SchemaDefinitionProperty<Date, AuthChallenge, Document<unknown, {}, AuthChallenge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AuthChallenge & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    ipAddress?: import("mongoose").SchemaDefinitionProperty<string, AuthChallenge, Document<unknown, {}, AuthChallenge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AuthChallenge & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    userAgent?: import("mongoose").SchemaDefinitionProperty<string, AuthChallenge, Document<unknown, {}, AuthChallenge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AuthChallenge & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, AuthChallenge>;
