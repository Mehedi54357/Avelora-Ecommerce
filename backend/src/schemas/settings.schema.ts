import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingsDocument = Settings & Document;

@Schema({ timestamps: true })
export class Settings {
  @Prop({ required: true, default: 'AVELORA' })
  storeName: string;

  @Prop({ required: false, default: 'support@avelora.com' })
  supportEmail: string;

  @Prop({ required: false, default: '+880 1800-AVELORA' })
  supportPhone: string;

  @Prop({ required: false, default: 'Dhaka, Bangladesh' })
  storeAddress: string;

  @Prop({ required: false, default: 'AVE' })
  orderPrefix: string;

  @Prop({ required: false, default: 'INV' })
  invoicePrefix: string;

  @Prop({ required: true, default: true })
  codEnabled: boolean;

  @Prop({ required: true, default: true })
  mobileBankingEnabled: boolean;

  @Prop({ required: false, default: 7 })
  returnWindowDays: number;

  @Prop({ required: false, default: 5 })
  lowStockThreshold: number;

  @Prop({ required: false, default: 70 })
  defaultDhakaDeliveryCharge: number;

  @Prop({ required: false, default: 130 })
  defaultOutsideDhakaDeliveryCharge: number;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
