import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { createHash, randomBytes } from 'crypto';
import { QrToken, QrTokenDocument, QrPurpose, QrTokenStatus } from '../../schemas/qr-token.schema';

@Injectable()
export class QrTokenService {
  constructor(
    @InjectModel(QrToken.name) private qrTokenModel: Model<QrTokenDocument>,
  ) {}

  hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken.trim()).digest('hex');
  }

  generateRawToken(prefix = 'AV1:F:'): { rawToken: string; payload: string; tokenHash: string } {
    const rawSecret = randomBytes(24).toString('base64url');
    const payload = `${prefix}${rawSecret}`;
    const tokenHash = this.hashToken(payload);
    return { rawToken: rawSecret, payload, tokenHash };
  }

  async createToken(params: {
    entityType: 'ORDER' | 'PRODUCT' | 'INVENTORY' | 'RETURN';
    entityId: string;
    purpose: QrPurpose;
    expiresInSeconds?: number;
    oneTime?: boolean;
    issuedBy?: string;
    metadata?: Record<string, any>;
    prefix?: string;
  }): Promise<{ token: QrToken; payload: string }> {
    const { payload, tokenHash } = this.generateRawToken(params.prefix || (params.purpose === QrPurpose.FULFILL_SHIPMENT ? 'AV1:F:' : 'AV1:T:'));
    
    // Default TTL: 7 days for fulfillment (604800s), 30 days for others
    const ttl = params.expiresInSeconds || 604800;
    const expiresAt = new Date(Date.now() + ttl * 1000);

    const token = await this.qrTokenModel.create({
      tokenHash,
      entityType: params.entityType,
      entityId: new Types.ObjectId(params.entityId) as any,
      purpose: params.purpose,
      status: QrTokenStatus.ACTIVE,
      oneTime: params.oneTime !== undefined ? params.oneTime : true,
      issuedBy: params.issuedBy && Types.ObjectId.isValid(params.issuedBy) ? (new Types.ObjectId(params.issuedBy) as any) : undefined,
      issuedAt: new Date(),
      expiresAt,
      metadata: params.metadata || {},
    });

    return { token, payload };
  }

  async verifyRawToken(rawPayload: string, requiredPurpose?: QrPurpose): Promise<QrTokenDocument> {
    if (!rawPayload || !rawPayload.trim()) {
      throw new BadRequestException('QR token payload is required');
    }

    const tokenHash = this.hashToken(rawPayload);
    const token = await this.qrTokenModel.findOne({ tokenHash }).exec();

    if (!token) {
      throw new NotFoundException('Invalid or unrecognized QR token');
    }

    if (token.status === QrTokenStatus.REVOKED) {
      throw new BadRequestException('This QR token has been revoked by an administrator');
    }

    if (token.status === QrTokenStatus.CONSUMED || token.consumedAt) {
      throw new ConflictException('This QR token has already been scanned and fulfilled');
    }

    if (new Date() > new Date(token.expiresAt)) {
      token.status = QrTokenStatus.EXPIRED;
      await token.save();
      throw new BadRequestException('This QR token has expired');
    }

    if (requiredPurpose && token.purpose !== requiredPurpose) {
      throw new BadRequestException(`QR token purpose mismatch. Expected "${requiredPurpose}", got "${token.purpose}"`);
    }

    return token;
  }

  async consumeToken(tokenId: string, actorId?: string): Promise<QrTokenDocument> {
    const actorObjId = actorId && Types.ObjectId.isValid(actorId) ? new Types.ObjectId(actorId) : undefined;
    const token = await this.qrTokenModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(tokenId),
        status: QrTokenStatus.ACTIVE,
        consumedAt: { $exists: false },
      },
      {
        $set: {
          status: QrTokenStatus.CONSUMED,
          consumedAt: new Date(),
          consumedBy: actorObjId,
        },
      },
      { new: true },
    ).exec();

    if (!token) {
      throw new ConflictException('Failed to consume QR token: it may have already been consumed or invalidated.');
    }

    return token;
  }

  async revokeToken(tokenId: string, actorId?: string): Promise<QrTokenDocument> {
    const actorObjId = actorId && Types.ObjectId.isValid(actorId) ? new Types.ObjectId(actorId) : undefined;
    const token = await this.qrTokenModel.findByIdAndUpdate(
      tokenId,
      {
        $set: {
          status: QrTokenStatus.REVOKED,
          revokedAt: new Date(),
          revokedBy: actorObjId,
        },
      },
      { new: true },
    ).exec();

    if (!token) {
      throw new NotFoundException('QR token not found');
    }

    return token;
  }
}
