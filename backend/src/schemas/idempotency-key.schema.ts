import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type IdempotencyKeyDocument = IdempotencyKey & Document;

@Schema({ timestamps: true })
export class IdempotencyKey {
  @Prop({ required: true, index: true })
  scope: string; // e.g. 'qr.fulfill', 'order.checkout', 'payment.callback'

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  actorId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, index: true })
  key: string;

  @Prop({ required: true })
  requestHash: string; // SHA-256 hash of the request payload

  @Prop({ required: true, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' })
  state: string;

  @Prop({ required: false })
  responseStatus?: number;

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  responseBody?: Record<string, any>;

  @Prop({ required: true })
  expiresAt: Date;
}

export const IdempotencyKeySchema = SchemaFactory.createForClass(IdempotencyKey);

IdempotencyKeySchema.index({ scope: 1, key: 1 }, { unique: true });
IdempotencyKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
