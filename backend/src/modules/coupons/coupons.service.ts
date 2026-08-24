import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument, CouponDiscountType } from '../../schemas/coupon.schema';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
  ) {}

  // 1. Validate & Apply Coupon (Authoritative Server-Side Calculation)
  async validateCoupon(code: string, subtotal: number): Promise<{
    valid: boolean;
    code: string;
    discountType: string;
    discountAmount: number;
    description?: string;
  }> {
    if (!code || !code.trim()) {
      throw new BadRequestException('Coupon code is required');
    }

    const coupon = await this.couponModel.findOne({ code: code.trim().toUpperCase() }).exec();

    if (!coupon) {
      throw new NotFoundException(`Coupon code "${code}" is invalid or does not exist`);
    }

    if (!coupon.isActive) {
      throw new BadRequestException(`Coupon code "${coupon.code}" is currently inactive`);
    }

    const now = new Date();
    if (coupon.startDate && now < new Date(coupon.startDate)) {
      throw new BadRequestException(`Coupon code "${coupon.code}" is not yet active`);
    }

    if (coupon.endDate && now > new Date(coupon.endDate)) {
      throw new BadRequestException(`Coupon code "${coupon.code}" has expired`);
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      throw new BadRequestException(
        `Minimum order amount of ৳${coupon.minOrderAmount} required to use coupon "${coupon.code}" (Current: ৳${subtotal})`,
      );
    }

    if (coupon.usageLimit && coupon.usageLimit > 0 && (coupon.usedCount || 0) >= coupon.usageLimit) {
      throw new BadRequestException(`Coupon code "${coupon.code}" usage limit has been reached`);
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === CouponDiscountType.PERCENT) {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && coupon.maxDiscount > 0) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }

    return {
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountAmount,
      description: coupon.description || `${coupon.discountType === CouponDiscountType.PERCENT ? `${coupon.discountValue}% Off` : `৳${coupon.discountValue} Off`}`,
    };
  }

  // 2. Increment usage upon confirmed checkout
  async recordUsage(code: string) {
    if (!code) return;
    await this.couponModel.updateOne(
      { code: code.trim().toUpperCase() },
      { $inc: { usedCount: 1 } },
    ).exec();
  }

  // Admin CRUD
  async findAll() {
    return this.couponModel.find().sort({ createdAt: -1 }).exec();
  }

  async create(data: Partial<Coupon>): Promise<Coupon> {
    const code = (data.code || '').trim().toUpperCase();
    if (!code) {
      throw new BadRequestException('Coupon code is required');
    }

    const existing = await this.couponModel.findOne({ code }).exec();
    if (existing) {
      throw new BadRequestException(`Coupon code "${code}" already exists`);
    }

    return this.couponModel.create({
      ...data,
      code,
      discountValue: Number(data.discountValue) || 0,
      minOrderAmount: Number(data.minOrderAmount) || 0,
      maxDiscount: Number(data.maxDiscount) || 0,
    });
  }

  async update(id: string, data: Partial<Coupon>): Promise<Coupon> {
    const payload: any = { ...data };
    if (payload.code) {
      payload.code = payload.code.trim().toUpperCase();
    }

    const updated = await this.couponModel.findByIdAndUpdate(id, payload, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException('Coupon not found');
    }
    return updated;
  }

  async delete(id: string) {
    const result = await this.couponModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Coupon not found');
    }
    return { success: true };
  }
}
