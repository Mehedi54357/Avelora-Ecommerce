import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import type { Response, Request } from 'express';
export declare class AuthController {
    private readonly authService;
    private readonly configService;
    constructor(authService: AuthService, configService: ConfigService);
    private getCookieOptions;
    login(body: any, req: Request, res: Response): Promise<{
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
    verifyOtp(body: {
        challengeId: string;
        otpCode: string;
    }, req: Request, res: Response): Promise<{
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
    resendOtp(body: {
        challengeId: string;
    }, req: Request): Promise<{
        challengeId: string;
        message: string;
    }>;
    forgotPassword(body: {
        email: string;
    }, req: Request): Promise<{
        success: boolean;
        message: string;
    } | {
        challengeId: string;
        success: boolean;
        message: string;
    }>;
    resetPassword(body: any, req: Request): Promise<{
        success: boolean;
        message: string;
    }>;
    logout(req: any, res: Response): Promise<{
        success: boolean;
        message: string;
    }>;
    refresh(body: {
        refreshToken: string;
    }): Promise<{
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
    changePassword(req: any, body: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getProfile(req: any): {
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
        };
    };
}
