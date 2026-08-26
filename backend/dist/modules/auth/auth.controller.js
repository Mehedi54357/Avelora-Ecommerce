"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const config_1 = require("@nestjs/config");
const auth_guard_1 = require("./auth.guard");
let AuthController = class AuthController {
    authService;
    configService;
    constructor(authService, configService) {
        this.authService = authService;
        this.configService = configService;
    }
    getCookieOptions() {
        const isProd = this.configService.get('NODE_ENV') === 'production';
        const secure = this.configService.get('COOKIE_SECURE') === 'true' || isProd;
        const sameSite = this.configService.get('COOKIE_SAME_SITE') ||
            (isProd ? 'none' : 'lax');
        const domain = this.configService.get('COOKIE_DOMAIN') || undefined;
        return {
            httpOnly: true,
            secure,
            sameSite,
            domain: domain && domain.trim() !== '' ? domain : undefined,
            path: '/',
            maxAge: 24 * 60 * 60 * 1000,
        };
    }
    async login(body, res) {
        const user = await this.authService.validateUser(body.email, body.password);
        const { token, user: userData } = await this.authService.login(user);
        const cookieOptions = this.getCookieOptions();
        try {
            res.cookie('token', token, cookieOptions);
        }
        catch { }
        return {
            message: 'Logged in successfully',
            token,
            user: {
                id: userData._id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
            },
        };
    }
    async logout(res) {
        const cookieOptions = this.getCookieOptions();
        res.clearCookie('token', {
            httpOnly: cookieOptions.httpOnly,
            secure: cookieOptions.secure,
            sameSite: cookieOptions.sameSite,
            domain: cookieOptions.domain,
            path: '/',
        });
        return { message: 'Logged out successfully' };
    }
    async refresh(body) {
        return this.authService.refreshToken(body?.refreshToken);
    }
    async changePassword(req, body) {
        const userId = req.user.sub;
        return this.authService.changePassword(userId, body.currentPassword, body.newPassword);
    }
    getProfile(req) {
        return {
            user: {
                id: req.user.sub,
                email: req.user.email,
                name: req.user.name,
                role: req.user.role,
            },
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)('change-password'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getProfile", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map