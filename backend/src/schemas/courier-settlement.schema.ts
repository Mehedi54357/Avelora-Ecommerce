import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CourierSettlementDocument = CourierSettlement & Document;

export enum SettlementStatus {
  MATCHED = 'MATCHED',
  AMOUNT_MISMATCH = 'AMOUNT_MISMATCH',
  MISSING_ORDER = 'MISSING_ORDER',
  PENDING = 'PENDING',
}

@Schema({ _id: false })
export class SettlementLine {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: false })
  orderId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  orderNumber: string;

  @Prop({ required: true })
  consignmentId: string;

  @Prop({ required: true, default: 0 })
  codCollected: number;

  @Prop({ required: true, default: 0 })
  deliveryFee: number;

  @Prop({ required: false, default: 0 })
  returnFee: number;

  @Prop({ required: false, default: 0 })
  adjustmentFee: number;

  @Prop({ required: true, default: 0 })
  netRemitted: number;

  @Prop({
    required: true,
    enum: Object.values(SettlementStatus),
    default: SettlementStatus.MATCHED,
  })
  status: SettlementStatus;

  @Prop({ required: false, default: '' })
  discrepancyNote?: string;
}

export const SettlementLineSchema = SchemaFactory.createForClass(SettlementLine);

@Schema({ timestamps: true })
export class CourierSettlement {
  @Prop({ required: true, default: 'Pathao' })
  provider: string; // 'Pathao', 'Steadfast', 'Paperfly', etc.

  @Prop({ required: true, unique: true, index: true })
  settlementBatchId: string; // e.g. SETTLE-20260826-001

  @Prop({ type: [SettlementLineSchema], default: [] })
  lines: SettlementLine[];

  @Prop({ required: true, default: 0 })
  totalCodCollected: number;

  @Prop({ required: true, default: 0 })
  totalFeesDeducted: number;

  @Prop({ required: true, default: 0 })
  totalNetRemitted: number;

  @Prop({ required: true, default: Date.now })
  settledAt: Date;

  @Prop({ required: false, default: 'MATCHED' })
  overallStatus: string;

  @Prop({ required: false, default: '' })
  bankDepositReference?: string;

  @Prop({ required: false, default: '' })
  notes?: string;

  @Prop({ required: false, default: 'ADMIN' })
  reconciledBy?: string;
}

export const CourierSettlementSchema = SchemaFactory.createForClass(CourierSettlement);
CourierSettlementSchema.index({ provider: 1, settledAt: -1 });
