import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CapitalTransactionDocument = CapitalTransaction & Document;

export enum CapitalTransactionType {
  OWNER_CAPITAL_IN = 'OWNER_CAPITAL_IN',
  OWNER_WITHDRAWAL = 'OWNER_WITHDRAWAL',
  LOAN_IN = 'LOAN_IN',
  LOAN_REPAYMENT = 'LOAN_REPAYMENT',
}

@Schema({ timestamps: true })
export class CapitalTransaction {
  @Prop({
    required: true,
    enum: Object.values(CapitalTransactionType),
    index: true,
  })
  type: CapitalTransactionType;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, default: 'Owner' })
  source: string;

  @Prop({ required: false, default: 'Bank' })
  account: string; // 'Bank', 'Cash', 'bKash Merchant', etc.

  @Prop({ required: true, default: Date.now })
  date: Date;

  @Prop({ required: false, default: '' })
  reference: string;

  @Prop({ required: false, default: '' })
  notes: string;

  @Prop({ required: false, default: 'ADMIN' })
  recordedBy: string;
}

export const CapitalTransactionSchema = SchemaFactory.createForClass(CapitalTransaction);
CapitalTransactionSchema.index({ type: 1, date: -1 });
CapitalTransactionSchema.index({ date: -1 });
