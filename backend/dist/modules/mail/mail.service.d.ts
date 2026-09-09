import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class MailService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private resend;
    private smtpTransporter;
    private isVerified;
    private transportType;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private initTransporters;
    private verifyTransporters;
    isConfigured(): boolean;
    private isDevMode;
    private printDevOtpBanner;
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
