import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingsDocument = Settings & Document;

@Schema({ timestamps: true })
export class Settings {
  @Prop({ required: true, default: 'AVELORA' })
  storeName: string;

  @Prop({ required: false, default: 'aveloraelegance@gmail.com' })
  supportEmail: string;

  @Prop({ required: false, default: '+8801353786336' })
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

  @Prop({ required: false, default: true })
  pathaoEnabled: boolean;

  @Prop({ required: false, default: false })
  pathaoSandbox: boolean;

  @Prop({ required: false, default: '' })
  pathaoBaseUrl: string;

  @Prop({ required: false, default: '' })
  pathaoClientId: string;

  @Prop({ required: false, default: '' })
  pathaoClientSecret: string;

  @Prop({ required: false, default: '' })
  pathaoUsername: string;

  @Prop({ required: false, default: '' })
  pathaoPassword: string;

  @Prop({ required: false, default: null })
  pathaoDefaultStoreId: number;

  @Prop({ required: false, default: '' })
  pathaoDefaultStoreName: string;

  @Prop({ required: false, default: null })
  pathaoLastSyncAt: Date;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
