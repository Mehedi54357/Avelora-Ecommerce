import { Document } from 'mongoose';
export type CouponDocument = Coupon & Document;
export declare enum CouponDiscountType {
    FIXED = "FIXED",
    PERCENT = "PERCENT"
}
export declare class Coupon {
    code: string;
    discountType: CouponDiscountType;
    discountValue: number;
    minOrderAmount: number;
    maxDiscount?: number;
    startDate?: Date;
    endDate?: Date;
    usageLimit?: number;
    usedCount: number;
    isActive: boolean;
    description?: string;
}
export declare const CouponSchema: import("mongoose").Schema<Coupon, import("mongoose").Model<Coupon, any, any, any, any, any, Coupon>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Coupon, Document<unknown, {}, Coupon, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Coupon & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    code?: import("mongoose").SchemaDefinitionProperty<string, Coupon, Document<unknown, {}, Coupon, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Coupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    discountType?: import("mongoose").SchemaDefinitionProperty<CouponDiscountType, Coupon, Document<unknown, {}, Coupon, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Coupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    discountValue?: import("mongoose").SchemaDefinitionProperty<number, Coupon, Document<unknown, {}, Coupon, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Coupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    minOrderAmount?: import("mongoose").SchemaDefinitionProperty<number, Coupon, Document<unknown, {}, Coupon, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Coupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    maxDiscount?: import("mongoose").SchemaDefinitionProperty<number | undefined, Coupon, Document<unknown, {}, Coupon, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Coupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    startDate?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Coupon, Document<unknown, {}, Coupon, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Coupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    endDate?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Coupon, Document<unknown, {}, Coupon, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Coupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    usageLimit?: import("mongoose").SchemaDefinitionProperty<number | undefined, Coupon, Document<unknown, {}, Coupon, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Coupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    usedCount?: import("mongoose").SchemaDefinitionProperty<number, Coupon, Document<unknown, {}, Coupon, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Coupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, Coupon, Document<unknown, {}, Coupon, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Coupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string | undefined, Coupon, Document<unknown, {}, Coupon, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Coupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Coupon>;
