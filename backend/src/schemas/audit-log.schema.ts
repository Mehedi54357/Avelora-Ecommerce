import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: { createdAt: 'timestamp', updatedAt: false } })
export class AuditLog {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false, index: true })
  adminId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  action: string; // e.g., UPDATE_PRODUCT, CHANGE_ORDER_STATUS

  @Prop({ required: true })
  entityType: string;

  @Prop({ required: true, index: true })
  entityId: string; // The ID of the affected resource

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  oldData?: Record<string, any>;

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  newData?: Record<string, any>;

  @Prop({ required: false })
  ipAddress?: string;

  @Prop({ required: false })
  userAgent?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
