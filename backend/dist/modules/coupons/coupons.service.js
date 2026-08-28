"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const coupon_schema_1 = require("../../schemas/coupon.schema");
let CouponsService = class CouponsService {
    constructor(couponModel) {
        this.couponModel = couponModel;
    }
    async validateCoupon(code, subtotal) {
        if (!code || !code.trim()) {
            throw new common_1.BadRequestException('Coupon code is required');
        }
        const coupon = await this.couponModel.findOne({ code: code.trim().toUpperCase() }).exec();
        if (!coupon) {
            throw new common_1.NotFoundException(`Coupon code "${code}" is invalid or does not exist`);
        }
        if (!coupon.isActive) {
            throw new common_1.BadRequestException(`Coupon code "${coupon.code}" is currently inactive`);
        }
        const now = new Date();
        if (coupon.startDate && now < new Date(coupon.startDate)) {
            throw new common_1.BadRequestException(`Coupon code "${coupon.code}" is not yet active`);
        }
        if (coupon.endDate && now > new Date(coupon.endDate)) {
            throw new common_1.BadRequestException(`Coupon code "${coupon.code}" has expired`);
        }
        if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
            throw new common_1.BadRequestException(`Minimum order amount of ৳${coupon.minOrderAmount} required to use coupon "${coupon.code}" (Current: ৳${subtotal})`);
        }
        if (coupon.usageLimit && coupon.usageLimit > 0 && (coupon.usedCount || 0) >= coupon.usageLimit) {
            throw new common_1.BadRequestException(`Coupon code "${coupon.code}" usage limit has been reached`);
        }
        let discountAmount = 0;
        if (coupon.discountType === coupon_schema_1.CouponDiscountType.PERCENT) {
            discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
            if (coupon.maxDiscount && coupon.maxDiscount > 0) {
                discountAmount = Math.min(discountAmount, coupon.maxDiscount);
            }
        }
        else {
            discountAmount = Math.min(coupon.discountValue, subtotal);
        }
        return {
            valid: true,
            code: coupon.code,
            discountType: coupon.discountType,
            discountAmount,
            description: coupon.description || `${coupon.discountType === coupon_schema_1.CouponDiscountType.PERCENT ? `${coupon.discountValue}% Off` : `৳${coupon.discountValue} Off`}`,
        };
    }
    async recordUsage(code) {
        if (!code)
            return;
        await this.couponModel.updateOne({ code: code.trim().toUpperCase() }, { $inc: { usedCount: 1 } }).exec();
    }
    async findAll() {
        return this.couponModel.find().sort({ createdAt: -1 }).exec();
    }
    async create(data) {
        const code = (data.code || '').trim().toUpperCase();
        if (!code) {
            throw new common_1.BadRequestException('Coupon code is required');
        }
        const existing = await this.couponModel.findOne({ code }).exec();
        if (existing) {
            throw new common_1.BadRequestException(`Coupon code "${code}" already exists`);
        }
        return this.couponModel.create({
            ...data,
            code,
            discountValue: Number(data.discountValue) || 0,
            minOrderAmount: Number(data.minOrderAmount) || 0,
            maxDiscount: Number(data.maxDiscount) || 0,
        });
    }
    async update(id, data) {
        const payload = { ...data };
        if (payload.code) {
            payload.code = payload.code.trim().toUpperCase();
        }
        const updated = await this.couponModel.findByIdAndUpdate(id, payload, { new: true }).exec();
        if (!updated) {
            throw new common_1.NotFoundException('Coupon not found');
        }
        return updated;
    }
    async delete(id) {
        const result = await this.couponModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException('Coupon not found');
        }
        return { success: true };
    }
};
exports.CouponsService = CouponsService;
exports.CouponsService = CouponsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(coupon_schema_1.Coupon.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CouponsService);
//# sourceMappingURL=coupons.service.js.map