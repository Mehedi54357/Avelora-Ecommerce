import { Document } from 'mongoose';
export type CapitalTransactionDocument = CapitalTransaction & Document;
export declare enum CapitalTransactionType {
    OWNER_CAPITAL_IN = "OWNER_CAPITAL_IN",
    OWNER_WITHDRAWAL = "OWNER_WITHDRAWAL",
    LOAN_IN = "LOAN_IN",
    LOAN_REPAYMENT = "LOAN_REPAYMENT"
}
export declare class CapitalTransaction {
    type: CapitalTransactionType;
    amount: number;
    source: string;
    account: string;
    date: Date;
    reference: string;
    notes: string;
    recordedBy: string;
}
export declare const CapitalTransactionSchema: import("mongoose").Schema<CapitalTransaction, import("mongoose").Model<CapitalTransaction, any, any, any, any, any, CapitalTransaction>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CapitalTransaction, Document<unknown, {}, CapitalTransaction, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<CapitalTransaction & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    type?: import("mongoose").SchemaDefinitionProperty<CapitalTransactionType, CapitalTransaction, Document<unknown, {}, CapitalTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CapitalTransaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    amount?: import("mongoose").SchemaDefinitionProperty<number, CapitalTransaction, Document<unknown, {}, CapitalTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CapitalTransaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    source?: import("mongoose").SchemaDefinitionProperty<string, CapitalTransaction, Document<unknown, {}, CapitalTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CapitalTransaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    account?: import("mongoose").SchemaDefinitionProperty<string, CapitalTransaction, Document<unknown, {}, CapitalTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CapitalTransaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    date?: import("mongoose").SchemaDefinitionProperty<Date, CapitalTransaction, Document<unknown, {}, CapitalTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CapitalTransaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    reference?: import("mongoose").SchemaDefinitionProperty<string, CapitalTransaction, Document<unknown, {}, CapitalTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CapitalTransaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    notes?: import("mongoose").SchemaDefinitionProperty<string, CapitalTransaction, Document<unknown, {}, CapitalTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CapitalTransaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    recordedBy?: import("mongoose").SchemaDefinitionProperty<string, CapitalTransaction, Document<unknown, {}, CapitalTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CapitalTransaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, CapitalTransaction>;
