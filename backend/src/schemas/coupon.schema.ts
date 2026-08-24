import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CouponDocument = Coupon & Document;

export enum CouponDiscountType {
  FIXED = 'FIXED', // Flat BDT deduction
  PERCENT = 'PERCENT', // Percentage discount
}

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, unique: true, uppercase: true, trim: true, index: true })
  code: string;

  @Prop({ required: true, enum: CouponDiscountType, default: CouponDiscountType.FIXED })
  discountType: CouponDiscountType;

  @Prop({ required: true, min: 1 })
  discountValue: number;

  @Prop({ required: false, default: 0 })
  minOrderAmount: number;

  @Prop({ required: false, default: 0 })
  maxDiscount?: number; // Caps percentage discount amount

  @Prop({ required: false })
  startDate?: Date;

  @Prop({ required: false })
  endDate?: Date;

  @Prop({ required: false, default: 0 })
  usageLimit?: number; // 0 = unlimited

  @Prop({ required: false, default: 0 })
  usedCount: number;

  @Prop({ required: true, default: true, index: true })
  isActive: boolean;

  @Prop({ required: false, default: '' })
  description?: string;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
