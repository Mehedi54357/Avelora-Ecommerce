import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type AuthChallengeDocument = AuthChallenge & Document;

export enum ChallengePurpose {
  ADMIN_LOGIN_OTP = 'ADMIN_LOGIN_OTP',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

@Schema({ timestamps: true })
export class AuthChallenge {
  @Prop({ required: true, unique: true, index: true })
  challengeId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, index: true })
  email: string;

  @Prop({ required: true })
  otpHash: string; // bcrypt hash of 6-digit code

  @Prop({ required: true, enum: ChallengePurpose, default: ChallengePurpose.ADMIN_LOGIN_OTP })
  purpose: ChallengePurpose;

  @Prop({ required: true, index: { expires: 0 } })
  expiresAt: Date; // TTL index automatically cleans up expired challenges

  @Prop({ required: true, default: 0 })
  attempts: number;

  @Prop({ required: true, default: 5 })
  maxAttempts: number;

  @Prop({ required: true })
  resendAvailableAt: Date;

  @Prop({ required: true, default: false })
  isConsumed: boolean;

  @Prop({ required: false })
  consumedAt?: Date;

  @Prop({ required: false })
  ipAddress?: string;

  @Prop({ required: false })
  userAgent?: string;
}

export const AuthChallengeSchema = SchemaFactory.createForClass(AuthChallenge);
