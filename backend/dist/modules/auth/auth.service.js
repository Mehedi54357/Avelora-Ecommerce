"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../users/users.service");
const mail_service_1 = require("../mail/mail.service");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const auth_challenge_schema_1 = require("../../schemas/auth-challenge.schema");
const user_schema_1 = require("../../schemas/user.schema");
const bcrypt = __importStar(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
const crypto = __importStar(require("crypto"));
function maskEmail(email) {
    if (!email || !email.includes('@'))
        return '******';
    const [user, domain] = email.split('@');
    if (user.length <= 2)
        return `${user[0]}*@${domain}`;
    return `${user[0]}${'*'.repeat(Math.min(user.length - 2, 6))}${user[user.length - 1]}@${domain}`;
}
let AuthService = AuthService_1 = class AuthService {
    constructor(usersService, configService, mailService, auditLogService, challengeModel) {
        this.usersService = usersService;
        this.configService = configService;
        this.mailService = mailService;
        this.auditLogService = auditLogService;
        this.challengeModel = challengeModel;
        this.logger = new common_1.Logger(AuthService_1.name);
        this.revokedTokens = new Set();
        this.failedAttempts = new Map();
    }
    checkRateLimit(key) {
        const record = this.failedAttempts.get(key);
        if (record && record.lockedUntil > Date.now()) {
            const waitSeconds = Math.ceil((record.lockedUntil - Date.now()) / 1000);
            throw new common_1.BadRequestException(`Too many failed attempts. Please wait ${waitSeconds} seconds before trying again.`);
        }
    }
    registerFailedAttempt(key) {
        const record = this.failedAttempts.get(key) || { count: 0, lockedUntil: 0 };
        record.count += 1;
        if (record.count >= 5) {
            record.lockedUntil = Date.now() + 5 * 60 * 1000;
        }
        this.failedAttempts.set(key, record);
    }
    clearFailedAttempts(key) {
        this.failedAttempts.delete(key);
    }
    async validateUser(email, pass, ip, userAgent) {
        const cleanEmail = String(email || '').trim().toLowerCase();
        const rateLimitKey = `login_${cleanEmail}_${ip || ''}`;
        this.checkRateLimit(rateLimitKey);
        const user = await this.usersService.findByEmail(cleanEmail);
        if (user && user.isActive) {
            const isMatch = await bcrypt.compare(pass, user.passwordHash);
            if (isMatch) {
                this.clearFailedAttempts(rateLimitKey);
                const { passwordHash, ...result } = user.toObject ? user.toObject() : user;
                return result;
            }
        }
        this.registerFailedAttempt(rateLimitKey);
        await this.auditLogService.logAction({
            action: 'LOGIN_FAILED',
            entityType: 'AUTH',
            entityId: cleanEmail,
            ipAddress: ip,
            userAgent,
            newData: { email: cleanEmail },
        });
        throw new common_1.UnauthorizedException('Invalid email or password.');
    }
    async initiateLogin(user, ip, userAgent) {
        const secret = this.configService.get('JWT_SECRET') || 'default_avelora_jwt_secret_key';
        const isPrivilegedAdmin = user.role === user_schema_1.UserRole.SUPER_ADMIN || user.role === user_schema_1.UserRole.ADMIN;
        if (isPrivilegedAdmin) {
            const challengeId = `chl_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
            const otpCode = crypto.randomInt(100000, 1000000).toString();
            const otpHash = await bcrypt.hash(otpCode, 10);
            await this.challengeModel.updateMany({ userId: user._id, purpose: auth_challenge_schema_1.ChallengePurpose.ADMIN_LOGIN_OTP, isConsumed: false }, { isConsumed: true, consumedAt: new Date() });
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
            const resendAvailableAt = new Date(Date.now() + 30 * 1000);
            await this.challengeModel.create({
                challengeId,
                userId: new mongoose_2.Types.ObjectId(user._id),
                email: user.email,
                otpHash,
                purpose: auth_challenge_schema_1.ChallengePurpose.ADMIN_LOGIN_OTP,
                expiresAt,
                resendAvailableAt,
                attempts: 0,
                maxAttempts: 5,
                isConsumed: false,
                ipAddress: ip,
                userAgent,
            });
            const mailResult = await this.mailService.sendAdminOtpEmail(user.email, otpCode, user.name);
            if (!mailResult.success) {
                await this.challengeModel.deleteOne({ challengeId });
                await this.auditLogService.logAction({
                    adminId: user._id,
                    action: 'OTP_DELIVERY_FAILED',
                    entityType: 'AUTH_CHALLENGE',
                    entityId: challengeId,
                    ipAddress: ip,
                    userAgent,
                    newData: { email: user.email, error: mailResult.message },
                });
                throw new common_1.BadRequestException(mailResult.configured
                    ? 'Verification email could not be sent. Please try again in a few moments.'
                    : 'Email OTP delivery is unavailable because email service is not configured. Please configure RESEND_API_KEY in server environment.');
            }
            await this.auditLogService.logAction({
                adminId: user._id,
                action: 'OTP_SENT',
                entityType: 'AUTH_CHALLENGE',
                entityId: challengeId,
                ipAddress: ip,
                userAgent,
                newData: { email: user.email, mailDelivered: true },
            });
            const pendingToken = jwt.sign({
                sub: user._id,
                email: user.email,
                challengeId,
                type: 'PENDING_2FA',
            }, secret, { expiresIn: '10m' });
            return {
                requiresOtp: true,
                challengeId,
                maskedEmail: maskEmail(user.email),
                pendingToken,
                message: 'Security verification code dispatched to your registered email.',
            };
        }
        return this.completeLoginSession(user, ip, userAgent);
    }
    async verifyOtp(challengeId, otpCode, ip, userAgent) {
        if (!challengeId || !otpCode || otpCode.trim().length !== 6) {
            throw new common_1.BadRequestException('Please enter a valid 6-digit verification code.');
        }
        const cleanCode = otpCode.trim();
        const challenge = await this.challengeModel.findOne({
            challengeId,
            purpose: auth_challenge_schema_1.ChallengePurpose.ADMIN_LOGIN_OTP,
        });
        if (!challenge || challenge.isConsumed) {
            throw new common_1.BadRequestException('Invalid or already consumed verification session. Please sign in again.');
        }
        if (new Date() > challenge.expiresAt) {
            throw new common_1.BadRequestException('Verification code has expired. Please request a new code.');
        }
        if (challenge.attempts >= challenge.maxAttempts) {
            throw new common_1.BadRequestException('Too many invalid attempts. Please request a new code.');
        }
        challenge.attempts += 1;
        const isMatch = await bcrypt.compare(cleanCode, challenge.otpHash);
        if (!isMatch) {
            await challenge.save();
            await this.auditLogService.logAction({
                adminId: challenge.userId.toString(),
                action: 'OTP_FAILED',
                entityType: 'AUTH_CHALLENGE',
                entityId: challengeId,
                ipAddress: ip,
                userAgent,
            });
            throw new common_1.BadRequestException('Invalid verification code.');
        }
        challenge.isConsumed = true;
        challenge.consumedAt = new Date();
        await challenge.save();
        const user = await this.usersService.findById(challenge.userId.toString());
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('User account inactive or not found.');
        }
        await this.auditLogService.logAction({
            adminId: user._id.toString(),
            action: 'OTP_VERIFIED',
            entityType: 'AUTH_CHALLENGE',
            entityId: challengeId,
            ipAddress: ip,
            userAgent,
        });
        const userObj = user.toObject ? user.toObject() : user;
        delete userObj.passwordHash;
        return this.completeLoginSession(userObj, ip, userAgent);
    }
    async resendOtp(challengeId, ip, userAgent) {
        const existing = await this.challengeModel.findOne({
            challengeId,
            purpose: auth_challenge_schema_1.ChallengePurpose.ADMIN_LOGIN_OTP,
        });
        if (!existing || existing.isConsumed) {
            throw new common_1.BadRequestException('Verification session expired. Please return to login.');
        }
        if (Date.now() < existing.resendAvailableAt.getTime()) {
            const wait = Math.ceil((existing.resendAvailableAt.getTime() - Date.now()) / 1000);
            throw new common_1.BadRequestException(`Please wait ${wait} seconds before requesting a new code.`);
        }
        existing.isConsumed = true;
        existing.consumedAt = new Date();
        await existing.save();
        const user = await this.usersService.findById(existing.userId.toString());
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('User account no longer active.');
        }
        const newChallengeId = `chl_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
        const newOtpCode = crypto.randomInt(100000, 1000000).toString();
        const newOtpHash = await bcrypt.hash(newOtpCode, 10);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        const resendAvailableAt = new Date(Date.now() + 30 * 1000);
        await this.challengeModel.create({
            challengeId: newChallengeId,
            userId: user._id,
            email: user.email,
            otpHash: newOtpHash,
            purpose: auth_challenge_schema_1.ChallengePurpose.ADMIN_LOGIN_OTP,
            expiresAt,
            resendAvailableAt,
            attempts: 0,
            maxAttempts: 5,
            isConsumed: false,
            ipAddress: ip,
            userAgent,
        });
        const mailResult = await this.mailService.sendAdminOtpEmail(user.email, newOtpCode, user.name);
        if (!mailResult.success) {
            await this.challengeModel.deleteOne({ challengeId: newChallengeId });
            throw new common_1.BadRequestException(mailResult.configured
                ? 'Verification email could not be sent. Please try again in a few moments.'
                : 'Email delivery is unavailable because email service is not configured in server environment.');
        }
        await this.auditLogService.logAction({
            adminId: user._id.toString(),
            action: 'OTP_SENT',
            entityType: 'AUTH_CHALLENGE',
            entityId: newChallengeId,
            ipAddress: ip,
            userAgent,
            newData: { resend: true },
        });
        return {
            challengeId: newChallengeId,
            message: 'A new verification code has been dispatched to your email.',
        };
    }
    async forgotPassword(email, ip, userAgent) {
        const cleanEmail = String(email || '').trim().toLowerCase();
        const genericResponse = {
            success: true,
            message: 'If this email is registered, password reset instructions have been sent.',
        };
        if (!cleanEmail)
            return genericResponse;
        const user = await this.usersService.findByEmail(cleanEmail);
        if (!user || !user.isActive) {
            return genericResponse;
        }
        await this.challengeModel.updateMany({ email: cleanEmail, purpose: auth_challenge_schema_1.ChallengePurpose.PASSWORD_RESET, isConsumed: false }, { isConsumed: true, consumedAt: new Date() });
        const resetChallengeId = `rst_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
        const resetCode = crypto.randomInt(100000, 1000000).toString();
        const resetHash = await bcrypt.hash(resetCode, 10);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const resendAvailableAt = new Date(Date.now() + 30 * 1000);
        await this.challengeModel.create({
            challengeId: resetChallengeId,
            userId: user._id,
            email: cleanEmail,
            otpHash: resetHash,
            purpose: auth_challenge_schema_1.ChallengePurpose.PASSWORD_RESET,
            expiresAt,
            resendAvailableAt,
            attempts: 0,
            maxAttempts: 5,
            isConsumed: false,
            ipAddress: ip,
            userAgent,
        });
        const mailResult = await this.mailService.sendPasswordResetEmail(cleanEmail, resetCode, user.name);
        if (!mailResult.success && !mailResult.configured) {
            this.logger.warn(`[ForgotPassword] Password reset email requested for ${maskEmail(cleanEmail)}, but email transport is not configured.`);
        }
        await this.auditLogService.logAction({
            adminId: user._id.toString(),
            action: 'PASSWORD_RESET_REQUESTED',
            entityType: 'AUTH',
            entityId: user._id.toString(),
            ipAddress: ip,
            userAgent,
        });
        return {
            ...genericResponse,
            challengeId: resetChallengeId,
        };
    }
    async resetPassword(payload, ip, userAgent) {
        const { email, resetCode, newPassword, challengeId } = payload;
        const cleanEmail = String(email || '').trim().toLowerCase();
        const cleanCode = String(resetCode || '').trim();
        if (!newPassword || newPassword.length < 12) {
            throw new common_1.BadRequestException('Password must be at least 12 characters.');
        }
        const hasUpper = /[A-Z]/.test(newPassword);
        const hasLower = /[a-z]/.test(newPassword);
        const hasNumber = /[0-9]/.test(newPassword);
        const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
        if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
            throw new common_1.BadRequestException('Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol.');
        }
        const query = {
            email: cleanEmail,
            purpose: auth_challenge_schema_1.ChallengePurpose.PASSWORD_RESET,
            isConsumed: false,
        };
        if (challengeId)
            query.challengeId = challengeId;
        const challenge = await this.challengeModel.findOne(query).sort({ createdAt: -1 });
        if (!challenge || challenge.isConsumed) {
            throw new common_1.BadRequestException('Invalid or expired password reset session.');
        }
        if (new Date() > challenge.expiresAt) {
            throw new common_1.BadRequestException('Password reset code has expired. Please request a new one.');
        }
        if (challenge.attempts >= challenge.maxAttempts) {
            throw new common_1.BadRequestException('Too many invalid attempts. Please request a new reset code.');
        }
        challenge.attempts += 1;
        const isMatch = await bcrypt.compare(cleanCode, challenge.otpHash);
        if (!isMatch) {
            await challenge.save();
            throw new common_1.BadRequestException('Invalid password reset code.');
        }
        challenge.isConsumed = true;
        challenge.consumedAt = new Date();
        await challenge.save();
        const user = await this.usersService.findByEmail(cleanEmail);
        if (!user)
            throw new common_1.BadRequestException('User not found.');
        const newHash = await bcrypt.hash(newPassword, 10);
        user.passwordHash = newHash;
        await user.save();
        await this.auditLogService.logAction({
            adminId: user._id.toString(),
            action: 'PASSWORD_RESET_COMPLETED',
            entityType: 'AUTH',
            entityId: user._id.toString(),
            ipAddress: ip,
            userAgent,
        });
        return {
            success: true,
            message: 'Password has been securely reset. Please sign in with your new credentials.',
        };
    }
    async completeLoginSession(user, ip, userAgent) {
        const secret = this.configService.get('JWT_SECRET') || 'default_avelora_jwt_secret_key';
        const refreshSecret = this.configService.get('JWT_REFRESH_SECRET') || `${secret}_refresh_2026_avelora`;
        const payload = {
            sub: user._id,
            email: user.email,
            role: user.role,
            name: user.name,
            permissions: user.permissions || [],
        };
        const token = jwt.sign(payload, secret, { expiresIn: '1d' });
        const refreshToken = jwt.sign({ sub: user._id, tokenVersion: user.tokenVersion || 1 }, refreshSecret, { expiresIn: '7d' });
        await this.usersService.updateLastLogin(user._id.toString(), ip);
        await this.auditLogService.logAction({
            adminId: user._id.toString(),
            action: 'LOGIN_SUCCESS',
            entityType: 'AUTH',
            entityId: user._id.toString(),
            ipAddress: ip,
            userAgent,
            newData: { email: user.email, role: user.role },
        });
        return {
            token,
            refreshToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions || [],
            },
        };
    }
    async refreshToken(refreshToken) {
        if (!refreshToken) {
            throw new common_1.BadRequestException('Refresh token is required.');
        }
        const secret = this.configService.get('JWT_SECRET') || 'default_avelora_jwt_secret_key';
        const refreshSecret = this.configService.get('JWT_REFRESH_SECRET') || `${secret}_refresh_2026_avelora`;
        try {
            const decoded = jwt.verify(refreshToken, refreshSecret);
            const user = await this.usersService.findById(decoded.sub);
            if (!user || !user.isActive) {
                throw new common_1.UnauthorizedException('User account no longer active.');
            }
            return this.completeLoginSession(user);
        }
        catch (e) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token.');
        }
    }
    async changePassword(userId, currentPass, newPass, ip, userAgent) {
        if (!currentPass || !newPass) {
            throw new common_1.BadRequestException('Current and new password are required.');
        }
        if (newPass.length < 12) {
            throw new common_1.BadRequestException('New password must be at least 12 characters.');
        }
        const user = await this.usersService.findByEmailOrId(userId);
        if (!user) {
            throw new common_1.BadRequestException('User not found.');
        }
        const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
        if (!isMatch) {
            throw new common_1.BadRequestException('Current password does not match.');
        }
        user.passwordHash = await bcrypt.hash(newPass, 10);
        await user.save();
        await this.auditLogService.logAction({
            adminId: userId,
            action: 'PASSWORD_CHANGED',
            entityType: 'AUTH',
            entityId: userId,
            ipAddress: ip,
            userAgent,
        });
        return { success: true, message: 'Password changed successfully.' };
    }
    async logout(token, userId, ip, userAgent) {
        if (token) {
            this.revokedTokens.add(token);
        }
        if (userId) {
            await this.auditLogService.logAction({
                adminId: userId,
                action: 'LOGOUT',
                entityType: 'AUTH',
                entityId: userId,
                ipAddress: ip,
                userAgent,
            });
        }
        return { success: true, message: 'Signed out securely.' };
    }
    isTokenRevoked(token) {
        return this.revokedTokens.has(token);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, mongoose_1.InjectModel)(auth_challenge_schema_1.AuthChallenge.name)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        config_1.ConfigService,
        mail_service_1.MailService,
        audit_log_service_1.AuditLogService,
        mongoose_2.Model])
], AuthService);
//# sourceMappingURL=auth.service.js.map