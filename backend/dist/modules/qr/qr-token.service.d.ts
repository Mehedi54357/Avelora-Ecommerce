import { Model } from 'mongoose';
import { QrToken, QrTokenDocument, QrPurpose } from '../../schemas/qr-token.schema';
export declare class QrTokenService {
    private qrTokenModel;
    constructor(qrTokenModel: Model<QrTokenDocument>);
    hashToken(rawToken: string): string;
    generateRawToken(prefix?: string): {
        rawToken: string;
        payload: string;
        tokenHash: string;
    };
    createToken(params: {
        entityType: 'ORDER' | 'PRODUCT' | 'INVENTORY' | 'RETURN';
        entityId: string;
        purpose: QrPurpose;
        expiresInSeconds?: number;
        oneTime?: boolean;
        issuedBy?: string;
        metadata?: Record<string, any>;
        prefix?: string;
    }): Promise<{
        token: QrToken;
        payload: string;
    }>;
    verifyRawToken(rawPayload: string, requiredPurpose?: QrPurpose): Promise<QrTokenDocument>;
    consumeToken(tokenId: string, actorId?: string): Promise<QrTokenDocument>;
    revokeToken(tokenId: string, actorId?: string): Promise<QrTokenDocument>;
}
