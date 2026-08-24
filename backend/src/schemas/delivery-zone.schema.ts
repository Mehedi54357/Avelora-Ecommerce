import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DeliveryZoneDocument = DeliveryZone & Document;

@Schema({ timestamps: true })
export class DeliveryZone {
  @Prop({ required: true })
  name: string; // e.g. "Inside Dhaka", "Outside Dhaka / Nationwide"

  @Prop({ type: [String], default: [] })
  districts: string[]; // List of district IDs/names, or '*' for nationwide fallback

  @Prop({ required: true, min: 0 })
  deliveryCharge: number; // in BDT, e.g. 70 or 130

  @Prop({ required: false, default: 0 })
  freeDeliveryThreshold?: number; // Order subtotal threshold for free delivery (0 = disabled)

  @Prop({ required: false, default: '2-3 Days' })
  estimatedDays?: string;

  @Prop({ required: true, default: true })
  isActive: boolean;
}

export const DeliveryZoneSchema = SchemaFactory.createForClass(DeliveryZone);
