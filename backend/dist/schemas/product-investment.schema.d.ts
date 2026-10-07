import { Document, Schema as MongooseSchema } from 'mongoose';
export type ProductInvestmentDocument = ProductInvestment & Document;
export declare class InvestmentAuditEntry {
    changedBy: string;
    date: Date;
    fieldChanged: string;
    previousValue: string;
    newValue: string;
    reason: string;
}
export declare const InvestmentAuditEntrySchema: MongooseSchema<InvestmentAuditEntry, import("mongoose").Model<InvestmentAuditEntry, any, any, any, any, any, InvestmentAuditEntry>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, InvestmentAuditEntry, Document<unknown, {}, InvestmentAuditEntry, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<InvestmentAuditEntry & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    changedBy?: import("mongoose").SchemaDefinitionProperty<string, InvestmentAuditEntry, Document<unknown, {}, InvestmentAuditEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InvestmentAuditEntry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    date?: import("mongoose").SchemaDefinitionProperty<Date, InvestmentAuditEntry, Document<unknown, {}, InvestmentAuditEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InvestmentAuditEntry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    fieldChanged?: import("mongoose").SchemaDefinitionProperty<string, InvestmentAuditEntry, Document<unknown, {}, InvestmentAuditEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InvestmentAuditEntry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    previousValue?: import("mongoose").SchemaDefinitionProperty<string, InvestmentAuditEntry, Document<unknown, {}, InvestmentAuditEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InvestmentAuditEntry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    newValue?: import("mongoose").SchemaDefinitionProperty<string, InvestmentAuditEntry, Document<unknown, {}, InvestmentAuditEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InvestmentAuditEntry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    reason?: import("mongoose").SchemaDefinitionProperty<string, InvestmentAuditEntry, Document<unknown, {}, InvestmentAuditEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InvestmentAuditEntry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, InvestmentAuditEntry>;
export declare class ProductInvestment {
    investmentId: string;
    date: Date;
    productId: MongooseSchema.Types.ObjectId;
    productName: string;
    variantSku: string;
    variantDetails: string;
    quantity: number;
    purchasePrice: number;
    boxCost: number;
    transportCost: number;
    polyCost: number;
    stickerCost: number;
    tagCost: number;
    otherCost: number;
    additionalCostPerUnit: number;
    actualCostPerUnit: number;
    totalInvestment: number;
    remainingStock: number;
    paymentAccount: string;
    notes: string;
    recordedBy: string;
    auditHistory: InvestmentAuditEntry[];
}
export declare const ProductInvestmentSchema: MongooseSchema<ProductInvestment, import("mongoose").Model<ProductInvestment, any, any, any, any, any, ProductInvestment>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProductInvestment, Document<unknown, {}, ProductInvestment, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ProductInvestment & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    investmentId?: import("mongoose").SchemaDefinitionProperty<string, ProductInvestment, Document<unknown, {}, ProductInvestment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductInvestment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    date?: import("mongoose").SchemaDefinitionProperty<Date, ProductInvestment, Document<unknown, {}, ProductInvestment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductInvestment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    productId?: import("mongoose").SchemaDefinitionProperty<MongooseSchema.Types.ObjectId, ProductInvestment, Document<unknown, {}, ProductInvestment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductInvestment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    productName?: import("mongoose").SchemaDefinitionProperty<string, ProductInvestment, Document<unknown, {}, ProductInvestment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductInvestment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    variantSku?: import("mongoose").SchemaDefinitionProperty<string, ProductInvestment, Document<unknown, {}, ProductInvestment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductInvestment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    variantDetails?: import("mongoose").SchemaDefinitionProperty<string, ProductInvestment, Document<unknown, {}, ProductInvestment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductInvestment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    quantity?: import("mongoose").SchemaDefinitionProperty<number, ProductInvestment, Document<unknown, {}, ProductInvestment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductInvestment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    purchasePrice?: import("mongoose").SchemaDefinitionProperty<number, ProductInvestment, Document<unknown, {}, ProductInvestment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductInvestment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    boxCost?: import("mongoose").SchemaDefinitionProperty<number, ProductInvestment, Document<unknown, {}, ProductInvestment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductInvestment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    transportCost?: import("mongoose").SchemaDefinitionProperty<number, ProductInvestment, Document<unknown, {}, ProductInvestment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductInvestment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    polyCost?: import("mongoose").SchemaDefinitionProperty<number, ProductInvestment, Document<unknown, {}, ProductInvestment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductInvestment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    stickerCost?: import("mongoose").SchemaDefinitionProperty<number, ProductInvestment, Document<unknown, {}, ProductInvestment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductInvestment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    tagCost?: import("mongoose").SchemaDefinitionProperty<number, ProductInvestment, Document<unknown, {}, ProductInvestment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductInvestment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    otherCost?: import("mongoose").SchemaDefinitionProperty<number, ProductInvestment, Document<unknown, {}, ProductInvestment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductInvestment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    additionalCostPerUnit?: import("mongoose").SchemaDefinitionProperty<number, ProductInvestment, Document<unknown, {}, ProductInvestment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductInvestment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    actualCostPerUnit?: import("mongoose").SchemaDefinitionProperty<number, ProductInvestment, Document<unknown, {}, ProductInvestment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductInvestment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    totalInvestment?: import("mongoose").SchemaDefinitionProperty<number, ProductInvestment, Document<unknown, {}, ProductInvestment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductInvestment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    remainingStock?: import("mongoose").SchemaDefinitionProperty<number, ProductInvestment, Document<unknown, {}, ProductInvestment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductInvestment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    paymentAccount?: import("mongoose").SchemaDefinitionProperty<string, ProductInvestment, Document<unknown, {}, ProductInvestment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductInvestment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    notes?: import("mongoose").SchemaDefinitionProperty<string, ProductInvestment, Document<unknown, {}, ProductInvestment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductInvestment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    recordedBy?: import("mongoose").SchemaDefinitionProperty<string, ProductInvestment, Document<unknown, {}, ProductInvestment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductInvestment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    auditHistory?: import("mongoose").SchemaDefinitionProperty<InvestmentAuditEntry[], ProductInvestment, Document<unknown, {}, ProductInvestment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductInvestment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, ProductInvestment>;
