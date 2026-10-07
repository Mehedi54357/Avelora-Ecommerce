import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProductInvestmentDocument = ProductInvestment & Document;

@Schema({ _id: false })
export class InvestmentAuditEntry {
  @Prop({ required: true })
  changedBy: string;

  @Prop({ required: true, default: Date.now })
  date: Date;

  @Prop({ required: true })
  fieldChanged: string;

  @Prop({ required: true })
  previousValue: string;

  @Prop({ required: true })
  newValue: string;

  @Prop({ required: false, default: '' })
  reason: string;
}

export const InvestmentAuditEntrySchema = SchemaFactory.createForClass(InvestmentAuditEntry);

@Schema({ timestamps: true })
export class ProductInvestment {
  @Prop({ required: true, unique: true, index: true })
  investmentId: string; // e.g. INV-20261007-001

  @Prop({ required: true, default: Date.now, index: true })
  date: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true, index: true })
  productId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true, index: true })
  variantSku: string;

  @Prop({ required: false, default: '' })
  variantDetails: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  purchasePrice: number; // Unit Purchase Price

  @Prop({ required: true, min: 0, default: 0 })
  boxCost: number;

  @Prop({ required: true, min: 0, default: 0 })
  transportCost: number;

  @Prop({ required: true, min: 0, default: 0 })
  polyCost: number;

  @Prop({ required: true, min: 0, default: 0 })
  stickerCost: number;

  @Prop({ required: true, min: 0, default: 0 })
  tagCost: number;

  @Prop({ required: true, min: 0, default: 0 })
  otherCost: number;

  @Prop({ required: true, min: 0 })
  additionalCostPerUnit: number;

  @Prop({ required: true, min: 0 })
  actualCostPerUnit: number;

  @Prop({ required: true, min: 0 })
  totalInvestment: number; // actualCostPerUnit * quantity

  @Prop({ required: false, default: 0 })
  remainingStock: number;

  @Prop({ required: false, default: 'Bank' })
  paymentAccount: string;

  @Prop({ required: false, default: '' })
  notes: string;

  @Prop({ required: true, default: 'ADMIN' })
  recordedBy: string;

  @Prop({ type: [InvestmentAuditEntrySchema], default: [] })
  auditHistory: InvestmentAuditEntry[];
}

export const ProductInvestmentSchema = SchemaFactory.createForClass(ProductInvestment);
ProductInvestmentSchema.index({ date: -1 });
ProductInvestmentSchema.index({ productId: 1, variantSku: 1 });
ProductInvestmentSchema.index({ createdAt: -1 });
