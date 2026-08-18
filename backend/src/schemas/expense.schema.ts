import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExpenseDocument = Expense & Document;

export enum ExpenseCategory {
  DELIVERY_COST = 'Delivery Cost',
  PACKAGING_COST = 'Packaging Cost',
  PAYMENT_FEE = 'Payment Fee',
  MARKETING_EXPENSE = 'Marketing Expense',
  OTHER_EXPENSE = 'Other Operating Expense',
}

@Schema({ timestamps: true })
export class Expense {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, enum: ExpenseCategory, default: ExpenseCategory.OTHER_EXPENSE })
  category: ExpenseCategory;

  @Prop({ required: true, min: 0 })
  amount: number; // in BDT

  @Prop({ required: true, default: Date.now })
  date: Date;

  @Prop({ required: false, default: '' })
  description?: string;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);

ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ category: 1 });
