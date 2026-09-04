import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuthChallengeDocument } from '../../schemas/auth-challenge.schema';
export declare class AuthService {
    private usersService;
    private configService;
    private mailService;
    private auditLogService;
    private challengeModel;
    private readonly logger;
    private revokedTokens;
    private failedAttempts;
    constructor(usersService: UsersService, configService: ConfigService, mailService: MailService, auditLogService: AuditLogService, challengeModel: Model<AuthChallengeDocument>);
    private checkRateLimit;
    private registerFailedAttempt;
    private clearFailedAttempts;
    validateUser(email: string, pass: string, ip?: string, userAgent?: string): Promise<any>;
    initiateLogin(user: any, ip?: string, userAgent?: string): Promise<{
        token: string;
        refreshToken: string;
        user: {
            _id: any;
            name: any;
            email: any;
            role: any;
            permissions: any;
        };
    } | {
        requiresOtp: boolean;
        challengeId: string;
        maskedEmail: string;
        pendingToken: string;
        message: string;
    }>;
    verifyOtp(challengeId: string, otpCode: string, ip?: string, userAgent?: string): Promise<{
        token: string;
        refreshToken: string;
        user: {
            _id: any;
            name: any;
            email: any;
            role: any;
            permissions: any;
        };
    }>;
    resendOtp(challengeId: string, ip?: string, userAgent?: string): Promise<{
        challengeId: string;
        message: string;
    }>;
    forgotPassword(email: string, ip?: string, userAgent?: string): Promise<{
        success: boolean;
        message: string;
    } | {
        challengeId: string;
        success: boolean;
        message: string;
    }>;
    resetPassword(payload: {
        email: string;
        resetCode: string;
        newPassword: string;
        challengeId?: string;
    }, ip?: string, userAgent?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private completeLoginSession;
    refreshToken(refreshToken: string): Promise<{
        token: string;
        refreshToken: string;
        user: {
            _id: any;
            name: any;
            email: any;
            role: any;
            permissions: any;
        };
    }>;
    changePassword(userId: string, currentPass: string, newPass: string, ip?: string, userAgent?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    logout(token?: string, userId?: string, ip?: string, userAgent?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    isTokenRevoked(token: string): boolean;
}
