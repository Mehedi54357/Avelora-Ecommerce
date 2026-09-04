import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export type SmtpFailureStage = 'DNS_RESOLUTION' | 'TCP_CONNECTION' | 'TLS_NEGOTIATION' | 'SMTP_PROTOCOL_HANDSHAKE' | 'SMTP_AUTHENTICATION' | 'UNKNOWN';
export declare function determineFailureStage(err: any): SmtpFailureStage;
export declare class MailService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private transporter;
    private isVerified;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private initTransporter;
    private verifyTransporter;
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
