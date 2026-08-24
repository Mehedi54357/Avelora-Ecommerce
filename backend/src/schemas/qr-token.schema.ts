import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type QrTokenDocument = QrToken & Document;

export enum QrPurpose {
  FULFILL_SHIPMENT = 'FULFILL_SHIPMENT',
  ORDER_TRACK = 'ORDER_TRACK',
  PRODUCT_RESOLVE = 'PRODUCT_RESOLVE',
  INVENTORY_LOOKUP = 'INVENTORY_LOOKUP',
  RETURN_RECEIVE = 'RETURN_RECEIVE',
}

export enum QrTokenStatus {
  ACTIVE = 'ACTIVE',
  CONSUMED = 'CONSUMED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

@Schema({ collection: 'qr_tokens', timestamps: true })
export class QrToken {
  // SHA-256 Hash of the raw secret token. Raw token is never stored in DB!
  @Prop({ required: true, unique: true, index: true })
  tokenHash: string;

  @Prop({ required: true, enum: ['ORDER', 'PRODUCT', 'INVENTORY', 'RETURN'] })
  entityType: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, index: true })
  entityId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: QrPurpose, index: true })
  purpose: QrPurpose;

  @Prop({ required: true, enum: QrTokenStatus, default: QrTokenStatus.ACTIVE, index: true })
  status: QrTokenStatus;

  @Prop({ required: true, default: true })
  oneTime: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  issuedBy?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  issuedAt: Date;

  @Prop({ required: true, index: true })
  expiresAt: Date;

  @Prop({ required: false })
  consumedAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  consumedBy?: MongooseSchema.Types.ObjectId;

  @Prop({ required: false })
  revokedAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  revokedBy?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  metadata?: Record<string, any>;
}

export const QrTokenSchema = SchemaFactory.createForClass(QrToken);

QrTokenSchema.index({ entityType: 1, entityId: 1, purpose: 1, status: 1 });
