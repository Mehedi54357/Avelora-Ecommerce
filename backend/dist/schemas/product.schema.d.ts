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
export declare class ProductImageItem {
    url: string;
    public_id?: string;
    sortOrder?: number;
    isPrimary?: boolean;
    alt?: string;
    width?: number;
    height?: number;
    variantColor?: string;
}
export declare const ProductImageItemSchema: MongooseSchema<ProductImageItem, import("mongoose").Model<ProductImageItem, any, any, any, any, any, ProductImageItem>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProductImageItem, Document<unknown, {}, ProductImageItem, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ProductImageItem & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    url?: import("mongoose").SchemaDefinitionProperty<string, ProductImageItem, Document<unknown, {}, ProductImageItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductImageItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    public_id?: import("mongoose").SchemaDefinitionProperty<string, ProductImageItem, Document<unknown, {}, ProductImageItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductImageItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    sortOrder?: import("mongoose").SchemaDefinitionProperty<number, ProductImageItem, Document<unknown, {}, ProductImageItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductImageItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    isPrimary?: import("mongoose").SchemaDefinitionProperty<boolean, ProductImageItem, Document<unknown, {}, ProductImageItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductImageItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    alt?: import("mongoose").SchemaDefinitionProperty<string, ProductImageItem, Document<unknown, {}, ProductImageItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductImageItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    width?: import("mongoose").SchemaDefinitionProperty<number, ProductImageItem, Document<unknown, {}, ProductImageItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductImageItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    height?: import("mongoose").SchemaDefinitionProperty<number, ProductImageItem, Document<unknown, {}, ProductImageItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductImageItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    variantColor?: import("mongoose").SchemaDefinitionProperty<string, ProductImageItem, Document<unknown, {}, ProductImageItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductImageItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, ProductImageItem>;
export declare class Product {
    name: string;
    subtitle?: string;
    slug: string;
    categoryId?: MongooseSchema.Types.ObjectId;
    description: string;
    images: string[];
    productImages?: ProductImageItem[];
    badge?: string;
    unitBadge?: string;
    rating?: number;
    reviewsCount?: number;
    features?: ProductFeature[];
    originalPrice: number;
    discountPercentage: number;
    salePrice: number;
    isDiscountActive?: boolean;
    discountStartDate?: Date;
    discountEndDate?: Date;
    isPublished: boolean;
    status: string;
    dataMode: string;
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
    productImages?: import("mongoose").SchemaDefinitionProperty<ProductImageItem[], Product, Document<unknown, {}, Product, {
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
    isDiscountActive?: import("mongoose").SchemaDefinitionProperty<boolean, Product, Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    discountStartDate?: import("mongoose").SchemaDefinitionProperty<Date, Product, Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    discountEndDate?: import("mongoose").SchemaDefinitionProperty<Date, Product, Document<unknown, {}, Product, {
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
    dataMode?: import("mongoose").SchemaDefinitionProperty<string, Product, Document<unknown, {}, Product, {
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
