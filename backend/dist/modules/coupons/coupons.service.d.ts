import { Model } from 'mongoose';
import { Coupon, CouponDocument } from '../../schemas/coupon.schema';
export declare class CouponsService {
    private couponModel;
    constructor(couponModel: Model<CouponDocument>);
    validateCoupon(code: string, subtotal: number): Promise<{
        valid: boolean;
        code: string;
        discountType: string;
        discountAmount: number;
        description?: string;
    }>;
    recordUsage(code: string): Promise<void>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, CouponDocument, {}, import("mongoose").DefaultSchemaOptions> & Coupon & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    create(data: Partial<Coupon>): Promise<Coupon>;
    update(id: string, data: Partial<Coupon>): Promise<Coupon>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
