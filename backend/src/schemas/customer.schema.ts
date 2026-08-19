import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema()
export class Address {
  @Prop({ required: true })
  district: string;

  @Prop({ required: false, default: '' })
  area?: string;

  @Prop({ required: true })
  fullAddress: string;
}

@Schema({ timestamps: true })
export class Customer {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  mobile: string;

  @Prop({ required: false })
  email?: string;

  @Prop({ type: [Address], default: [] })
  addresses: Address[];

  @Prop({ default: 0 })
  totalOrders: number;

  @Prop({ default: 0 })
  totalSpent: number;

  @Prop({ default: false })
  isGuest: boolean;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
