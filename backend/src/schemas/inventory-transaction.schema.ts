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
  DAMAGE = 'DAMAGE',
  QR_STOCK_IN = 'QR_STOCK_IN',
  QR_STOCK_OUT = 'QR_STOCK_OUT',
}

@Schema({ timestamps: { createdAt: 'timestamp', updatedAt: false } })
export class InventoryTransaction {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true, index: true })
  productId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, index: true })
  variantSku: string;

  @Prop({ required: false, default: 0 })
  previousQuantity?: number;

  @Prop({ required: true })
  quantityChange: number; // e.g. -2 for reservation/deduction, +5 for restock

  @Prop({ required: false, default: 0 })
  newQuantity?: number;

  @Prop({ required: true, enum: InventoryTransactionType, index: true })
  transactionType: InventoryTransactionType;

  @Prop({ required: false })
  orderId?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  actorId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: false, default: '' })
  note?: string;
}

export const InventoryTransactionSchema = SchemaFactory.createForClass(InventoryTransaction);

InventoryTransactionSchema.index({ timestamp: -1 });
InventoryTransactionSchema.index({ productId: 1, variantSku: 1, timestamp: -1 });
