import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
export declare class AuthController {
    private readonly authService;
    private readonly configService;
    constructor(authService: AuthService, configService: ConfigService);
    private getCookieOptions;
    login(body: any, res: Response): Promise<{
        message: string;
        token: string;
        user: {
            id: any;
            name: any;
            email: any;
            role: any;
        };
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
    refresh(body: {
        refreshToken: string;
    }): Promise<{
        token: string;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            _id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
            role: import("../../schemas/user.schema").UserRole;
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
