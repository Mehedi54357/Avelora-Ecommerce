import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class MailService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private resend;
    private isVerified;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private initResend;
    private verifyResend;
    isConfigured(): boolean;
    sendAdminOtpEmail(toEmail: string, otpCode: string, adminName?: string): Promise<{
        success: boolean;
        message: string;
        configured: boolean;
    }>;
    sendPasswordResetEmail(toEmail: string, resetCode: string, adminName?: string): Promise<{
        success: boolean;
        message: string;
        configured: boolean;
    }>;
}
