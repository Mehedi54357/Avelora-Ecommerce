import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ReturnRequestDocument = ReturnRequest & Document;

export enum ReturnStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ITEM_RECEIVED = 'ITEM_RECEIVED',
  INSPECTED_RESTOCKED = 'INSPECTED_RESTOCKED',
  INSPECTED_DAMAGED = 'INSPECTED_DAMAGED',
  REFUNDED = 'REFUNDED',
}

@Schema({ timestamps: true })
export class ReturnRequest {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: true, index: true })
  orderId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  orderReferenceId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer', required: false })
  customerId?: MongooseSchema.Types.ObjectId;

  @Prop({
    type: [
      {
        productId: { type: MongooseSchema.Types.ObjectId, ref: 'Product' },
        sku: String,
        variant: String,
        quantity: Number,
        unitPrice: Number,
        restockable: Boolean,
      },
    ],
    required: true,
  })
  items: Array<{
    productId: MongooseSchema.Types.ObjectId;
    sku: string;
    variant: string;
    quantity: number;
    unitPrice: number;
    restockable: boolean;
  }>;

  @Prop({ required: true })
  reason: string;

  @Prop({ default: ReturnStatus.PENDING_REVIEW, enum: Object.values(ReturnStatus) })
  status: ReturnStatus;

  @Prop({ default: 0 })
  refundAmount: number;

  @Prop({ default: 'bKash' })
  refundMethod: string;

  @Prop({ required: false })
  refundTransactionId?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  inspectedBy?: MongooseSchema.Types.ObjectId;

  @Prop({ required: false })
  inspectionNotes?: string;

  @Prop({ required: false })
  receivedAt?: Date;

  @Prop({ required: false })
  refundedAt?: Date;
}

export const ReturnRequestSchema = SchemaFactory.createForClass(ReturnRequest);
