import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: true, index: true })
  orderId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  transactionId: string;

  @Prop({ required: true })
  method: string;

  @Prop({ required: true })
  provider: string;

  // Stored in minor units
  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  status: string;

  @Prop({ required: false })
  paidAt?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
