import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PathaoTokenDocument = PathaoToken & Document;

@Schema({ timestamps: true })
export class PathaoToken {
  @Prop({ required: true, default: 'primary', unique: true })
  key: string;

  @Prop({ required: true })
  accessToken: string;

  @Prop({ required: true })
  refreshToken: string;

  @Prop({ required: true })
  tokenType: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ required: false, type: Object })
  selectedStore?: {
    store_id: number;
    store_name: string;
    store_address: string;
  };
}

export const PathaoTokenSchema = SchemaFactory.createForClass(PathaoToken);
