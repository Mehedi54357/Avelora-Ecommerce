import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SupplierDocument = Supplier & Document;

@Schema({ timestamps: true })
export class Supplier {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: false, trim: true, default: '' })
  email: string;

  @Prop({ required: false, trim: true, default: '' })
  address: string;

  @Prop({ required: false, trim: true, default: '' })
  contactPerson: string;

  @Prop({ required: false, default: 0 })
  totalPurchased: number;

  @Prop({ required: false, default: 0 })
  totalPaid: number;

  @Prop({ required: false, default: 0 })
  totalDue: number;

  @Prop({ required: false, default: '' })
  notes: string;

  @Prop({ required: false, default: true })
  isActive: boolean;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
SupplierSchema.index({ name: 1 });
SupplierSchema.index({ phone: 1 });
