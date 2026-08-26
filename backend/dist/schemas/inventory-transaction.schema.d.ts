import { Document, Schema as MongooseSchema } from 'mongoose';
export type InventoryTransactionDocument = InventoryTransaction & Document;
export declare enum InventoryTransactionType {
    RESERVE = "RESERVE",
    RELEASE_RESERVATION = "RELEASE_RESERVATION",
    FULFILLMENT = "FULFILLMENT",
    RESTOCK = "RESTOCK",
    RETURN = "RETURN",
    MANUAL_ADJUSTMENT = "MANUAL_ADJUSTMENT",
    DAMAGE = "DAMAGE",
    QR_STOCK_IN = "QR_STOCK_IN",
    QR_STOCK_OUT = "QR_STOCK_OUT"
}
export declare class InventoryTransaction {
    productId: MongooseSchema.Types.ObjectId;
    variantSku: string;
    previousQuantity?: number;
    quantityChange: number;
    newQuantity?: number;
    transactionType: InventoryTransactionType;
    orderId?: string;
    actorId?: MongooseSchema.Types.ObjectId;
    note?: string;
}
export declare const InventoryTransactionSchema: MongooseSchema<InventoryTransaction, import("mongoose").Model<InventoryTransaction, any, any, any, any, any, InventoryTransaction>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, InventoryTransaction, Document<unknown, {}, InventoryTransaction, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<InventoryTransaction & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    productId?: import("mongoose").SchemaDefinitionProperty<MongooseSchema.Types.ObjectId, InventoryTransaction, Document<unknown, {}, InventoryTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryTransaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    variantSku?: import("mongoose").SchemaDefinitionProperty<string, InventoryTransaction, Document<unknown, {}, InventoryTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryTransaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    previousQuantity?: import("mongoose").SchemaDefinitionProperty<number | undefined, InventoryTransaction, Document<unknown, {}, InventoryTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryTransaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    quantityChange?: import("mongoose").SchemaDefinitionProperty<number, InventoryTransaction, Document<unknown, {}, InventoryTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryTransaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    newQuantity?: import("mongoose").SchemaDefinitionProperty<number | undefined, InventoryTransaction, Document<unknown, {}, InventoryTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryTransaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    transactionType?: import("mongoose").SchemaDefinitionProperty<InventoryTransactionType, InventoryTransaction, Document<unknown, {}, InventoryTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryTransaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    orderId?: import("mongoose").SchemaDefinitionProperty<string | undefined, InventoryTransaction, Document<unknown, {}, InventoryTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryTransaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    actorId?: import("mongoose").SchemaDefinitionProperty<MongooseSchema.Types.ObjectId | undefined, InventoryTransaction, Document<unknown, {}, InventoryTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryTransaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    note?: import("mongoose").SchemaDefinitionProperty<string | undefined, InventoryTransaction, Document<unknown, {}, InventoryTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryTransaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, InventoryTransaction>;
