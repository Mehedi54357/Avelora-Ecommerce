import { CouponsService } from './coupons.service';
export declare class CouponsController {
    private readonly couponsService;
    constructor(couponsService: CouponsService);
    validateCoupon(body: {
        code: string;
        subtotal: number;
    }): Promise<{
        valid: boolean;
        code: string;
        discountType: string;
        discountAmount: number;
        description?: string;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("../../schemas/coupon.schema").CouponDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/coupon.schema").Coupon & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    create(body: any): Promise<import("../../schemas/coupon.schema").Coupon>;
    update(id: string, body: any): Promise<import("../../schemas/coupon.schema").Coupon>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
