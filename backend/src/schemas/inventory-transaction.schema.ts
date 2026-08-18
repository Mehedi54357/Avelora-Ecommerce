import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type InventoryTransactionDocument = InventoryTransaction & Document;

export enum InventoryTransactionType {
  RESERVE = 'RESERVE',
  RELEASE_RESERVATION = 'RELEASE_RESERVATION',
  FULFILLMENT = 'FULFILLMENT',
  RESTOCK = 'RESTOCK',
  RETURN = 'RETURN',
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',
}

@Schema({ timestamps: { createdAt: 'timestamp', updatedAt: false } })
export class InventoryTransaction {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true, index: true })
  productId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, index: true })
  variantSku: string;

  @Prop({ required: true })
  quantityChange: number; // e.g. -2 for reservation/deduction, +5 for restock

  @Prop({ required: true, enum: InventoryTransactionType, index: true })
  transactionType: InventoryTransactionType;

  @Prop({ required: false })
  orderId?: string;

  @Prop({ required: false, default: '' })
  note?: string;
}

export const InventoryTransactionSchema = SchemaFactory.createForClass(InventoryTransaction);

InventoryTransactionSchema.index({ timestamp: -1 });
