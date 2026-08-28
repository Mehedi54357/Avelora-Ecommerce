import { Document } from 'mongoose';
export type SupplierDocument = Supplier & Document;
export declare class Supplier {
    name: string;
    phone: string;
    email: string;
    address: string;
    contactPerson: string;
    totalPurchased: number;
    totalPaid: number;
    totalDue: number;
    notes: string;
    isActive: boolean;
}
export declare const SupplierSchema: import("mongoose").Schema<Supplier, import("mongoose").Model<Supplier, any, any, any, any, any, Supplier>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Supplier, Document<unknown, {}, Supplier, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Supplier & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Supplier, Document<unknown, {}, Supplier, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Supplier & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    phone?: import("mongoose").SchemaDefinitionProperty<string, Supplier, Document<unknown, {}, Supplier, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Supplier & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    email?: import("mongoose").SchemaDefinitionProperty<string, Supplier, Document<unknown, {}, Supplier, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Supplier & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    address?: import("mongoose").SchemaDefinitionProperty<string, Supplier, Document<unknown, {}, Supplier, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Supplier & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    contactPerson?: import("mongoose").SchemaDefinitionProperty<string, Supplier, Document<unknown, {}, Supplier, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Supplier & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    totalPurchased?: import("mongoose").SchemaDefinitionProperty<number, Supplier, Document<unknown, {}, Supplier, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Supplier & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    totalPaid?: import("mongoose").SchemaDefinitionProperty<number, Supplier, Document<unknown, {}, Supplier, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Supplier & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    totalDue?: import("mongoose").SchemaDefinitionProperty<number, Supplier, Document<unknown, {}, Supplier, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Supplier & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    notes?: import("mongoose").SchemaDefinitionProperty<string, Supplier, Document<unknown, {}, Supplier, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Supplier & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, Supplier, Document<unknown, {}, Supplier, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Supplier & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, Supplier>;
