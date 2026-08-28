import { Document, Schema as MongooseSchema } from 'mongoose';
export type ProductDocument = Product & Document;
export declare class ProductVariant {
    sku: string;
    color: string;
    colorHex?: string;
    image?: string;
    size: string;
    price: number;
    costPrice: number;
    weightedAverageCost?: number;
    stockQuantity: number;
    reservedQuantity: number;
    safetyStock?: number;
}
export declare const ProductVariantSchema: MongooseSchema<ProductVariant, import("mongoose").Model<ProductVariant, any, any, any, any, any, ProductVariant>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProductVariant, Document<unknown, {}, ProductVariant, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ProductVariant & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    sku?: import("mongoose").SchemaDefinitionProperty<string, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductVariant & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    color?: import("mongoose").SchemaDefinitionProperty<string, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductVariant & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    colorHex?: import("mongoose").SchemaDefinitionProperty<string, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductVariant & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    image?: import("mongoose").SchemaDefinitionProperty<string, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductVariant & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    size?: import("mongoose").SchemaDefinitionProperty<string, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductVariant & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    price?: import("mongoose").SchemaDefinitionProperty<number, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductVariant & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    costPrice?: import("mongoose").SchemaDefinitionProperty<number, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductVariant & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    weightedAverageCost?: import("mongoose").SchemaDefinitionProperty<number, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductVariant & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    stockQuantity?: import("mongoose").SchemaDefinitionProperty<number, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductVariant & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    reservedQuantity?: import("mongoose").SchemaDefinitionProperty<number, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductVariant & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    safetyStock?: import("mongoose").SchemaDefinitionProperty<number, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductVariant & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, ProductVariant>;
export declare class ProductFeature {
    title: string;
    subtitle: string;
    icon: string;
}
export declare const ProductFeatureSchema: MongooseSchema<ProductFeature, import("mongoose").Model<ProductFeature, any, any, any, any, any, ProductFeature>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProductFeature, Document<unknown, {}, ProductFeature, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ProductFeature & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    title?: import("mongoose").SchemaDefinitionProperty<string, ProductFeature, Document<unknown, {}, ProductFeature, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductFeature & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    subtitle?: import("mongoose").SchemaDefinitionProperty<string, ProductFeature, Document<unknown, {}, ProductFeature, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductFeature & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    icon?: import("mongoose").SchemaDefinitionProperty<string, ProductFeature, Document<unknown, {}, ProductFeature, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductFeature & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, ProductFeature>;
export declare class Product {
    name: string;
    subtitle?: string;
    slug: string;
    categoryId?: MongooseSchema.Types.ObjectId;
    description: string;
    images: string[];
    badge?: string;
    unitBadge?: string;
    rating?: number;
    reviewsCount?: number;
    features?: ProductFeature[];
    originalPrice: number;
    discountPercentage: number;
    salePrice: number;
    isPublished: boolean;
    status: string;
    qr?: {
        enabled: boolean;
        publicCode: string;
        generatedAt?: Date;
    };
    variants: ProductVariant[];
}
export declare const ProductSchema: MongooseSchema<Product, import("mongoose").Model<Product, any, any, any, any, any, Product>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Product, Document<unknown, {}, Product, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Product, Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    subtitle?: import("mongoose").SchemaDefinitionProperty<string, Product, Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    slug?: import("mongoose").SchemaDefinitionProperty<string, Product, Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    categoryId?: import("mongoose").SchemaDefinitionProperty<MongooseSchema.Types.ObjectId, Product, Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    description?: import("mongoose").SchemaDefinitionProperty<string, Product, Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    images?: import("mongoose").SchemaDefinitionProperty<string[], Product, Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    badge?: import("mongoose").SchemaDefinitionProperty<string, Product, Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    unitBadge?: import("mongoose").SchemaDefinitionProperty<string, Product, Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    rating?: import("mongoose").SchemaDefinitionProperty<number, Product, Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    reviewsCount?: import("mongoose").SchemaDefinitionProperty<number, Product, Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    features?: import("mongoose").SchemaDefinitionProperty<ProductFeature[], Product, Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    originalPrice?: import("mongoose").SchemaDefinitionProperty<number, Product, Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    discountPercentage?: import("mongoose").SchemaDefinitionProperty<number, Product, Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    salePrice?: import("mongoose").SchemaDefinitionProperty<number, Product, Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    isPublished?: import("mongoose").SchemaDefinitionProperty<boolean, Product, Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    status?: import("mongoose").SchemaDefinitionProperty<string, Product, Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    qr?: import("mongoose").SchemaDefinitionProperty<{
        enabled: boolean;
        publicCode: string;
        generatedAt?: Date;
    }, Product, Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    variants?: import("mongoose").SchemaDefinitionProperty<ProductVariant[], Product, Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, Product>;
