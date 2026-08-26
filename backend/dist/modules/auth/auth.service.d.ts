import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    private configService;
    private readonly logger;
    private revokedTokens;
    constructor(usersService: UsersService, configService: ConfigService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        token: string;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: any;
    }>;
    refreshToken(refreshToken: string): Promise<{
        token: string;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            _id: import("mongoose").Types.ObjectId;
            name: string;
            email: string | undefined;
            role: import("../../schemas/user.schema").UserRole;
        };
    }>;
    logout(token?: string, refreshToken?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    changePassword(userId: string, oldPass: string, newPass: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
