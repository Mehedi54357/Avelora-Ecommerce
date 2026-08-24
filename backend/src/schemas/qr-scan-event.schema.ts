import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type QrScanEventDocument = QrScanEvent & Document;

@Schema({ collection: 'qr_scan_events', timestamps: { createdAt: true, updatedAt: false } })
export class QrScanEvent {
  @Prop({ required: true, unique: true, index: true })
  eventId: string; // e.g. QSE-01J61...

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'QrToken', required: false, index: true })
  tokenId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: ['ORDER', 'PRODUCT', 'INVENTORY', 'RETURN'], index: true })
  entityType: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, index: true })
  entityId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false, index: true })
  actorId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: false, default: 'STAFF' })
  actorRole: string;

  @Prop({ required: true })
  action: string; // e.g. VERIFY, MARK_SHIPPED, STOCK_IN, RETURN_RECEIVE

  @Prop({ required: true, enum: ['SUCCESS', 'CONFLICT', 'REJECTED', 'FAILED'] })
  result: string;

  @Prop({ required: false })
  previousStatus?: string;

  @Prop({ required: false })
  newStatus?: string;

  @Prop({ required: true, enum: ['CAMERA', 'PHOTO', 'MANUAL'], default: 'CAMERA' })
  source: string;

  @Prop({ required: false, index: true })
  idempotencyKey?: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  clientInfo?: Record<string, any>;

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  evidence?: {
    provider: string;
    publicId: string;
    url?: string;
    reason?: string;
  };
}

export const QrScanEventSchema = SchemaFactory.createForClass(QrScanEvent);

QrScanEventSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
QrScanEventSchema.index({ actorId: 1, createdAt: -1 });
