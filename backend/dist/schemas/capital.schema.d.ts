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
    }>> | undefined;
    amount?: import("mongoose").SchemaDefinitionProperty<number, CapitalTransaction, Document<unknown, {}, CapitalTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CapitalTransaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    source?: import("mongoose").SchemaDefinitionProperty<string, CapitalTransaction, Document<unknown, {}, CapitalTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CapitalTransaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    account?: import("mongoose").SchemaDefinitionProperty<string, CapitalTransaction, Document<unknown, {}, CapitalTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CapitalTransaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    date?: import("mongoose").SchemaDefinitionProperty<Date, CapitalTransaction, Document<unknown, {}, CapitalTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CapitalTransaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    reference?: import("mongoose").SchemaDefinitionProperty<string, CapitalTransaction, Document<unknown, {}, CapitalTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CapitalTransaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    notes?: import("mongoose").SchemaDefinitionProperty<string, CapitalTransaction, Document<unknown, {}, CapitalTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CapitalTransaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    recordedBy?: import("mongoose").SchemaDefinitionProperty<string, CapitalTransaction, Document<unknown, {}, CapitalTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CapitalTransaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, CapitalTransaction>;
