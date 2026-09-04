import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import {
  AuthChallenge,
  AuthChallengeDocument,
  ChallengePurpose,
} from '../../schemas/auth-challenge.schema';
import { UserRole } from '../../schemas/user.schema';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '******';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}*@${domain}`;
  return `${user[0]}${'*'.repeat(Math.min(user.length - 2, 6))}${user[user.length - 1]}@${domain}`;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // In-memory token revocation set
  private revokedTokens = new Set<string>();

  // Failed login tracking for rate limiting (email/IP -> { count, lockedUntil })
  private failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private mailService: MailService,
    private auditLogService: AuditLogService,
    @InjectModel(AuthChallenge.name)
    private challengeModel: Model<AuthChallengeDocument>,
  ) {}

  private checkRateLimit(key: string) {
    const record = this.failedAttempts.get(key);
    if (record && record.lockedUntil > Date.now()) {
      const waitSeconds = Math.ceil((record.lockedUntil - Date.now()) / 1000);
      throw new BadRequestException(
        `Too many failed attempts. Please wait ${waitSeconds} seconds before trying again.`,
      );
    }
  }

  private registerFailedAttempt(key: string) {
    const record = this.failedAttempts.get(key) || { count: 0, lockedUntil: 0 };
    record.count += 1;
    if (record.count >= 5) {
      // 5 min lockout after 5 consecutive failures
      record.lockedUntil = Date.now() + 5 * 60 * 1000;
    }
    this.failedAttempts.set(key, record);
  }

  private clearFailedAttempts(key: string) {
    this.failedAttempts.delete(key);
  }

  async validateUser(email: string, pass: string, ip?: string, userAgent?: string): Promise<any> {
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

    throw new UnauthorizedException('Invalid email or password.');
  }

  async initiateLogin(user: any, ip?: string, userAgent?: string) {
    const secret = this.configService.get<string>('JWT_SECRET') || 'default_avelora_jwt_secret_key';
    const isPrivilegedAdmin = user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN;

    // SUPER_ADMIN and ADMIN strictly require 2FA Email OTP
    if (isPrivilegedAdmin) {
      const challengeId = `chl_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
      // Cryptographically secure random 6-digit OTP
      const otpCode = crypto.randomInt(100000, 1000000).toString();
      // Store HASH ONLY — Plaintext OTP exists only in memory for constructing email
      const otpHash = await bcrypt.hash(otpCode, 10);

      // Invalidate existing active login challenges for this user
      await this.challengeModel.updateMany(
        { userId: user._id, purpose: ChallengePurpose.ADMIN_LOGIN_OTP, isConsumed: false },
        { isConsumed: true, consumedAt: new Date() },
      );

      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      const resendAvailableAt = new Date(Date.now() + 30 * 1000); // 30 seconds

      await this.challengeModel.create({
        challengeId,
        userId: new Types.ObjectId(user._id) as any,
        email: user.email,
        otpHash,
        purpose: ChallengePurpose.ADMIN_LOGIN_OTP,
        expiresAt,
        resendAvailableAt,
        attempts: 0,
        maxAttempts: 5,
        isConsumed: false,
        ipAddress: ip,
        userAgent,
      });

      // Dispatch Real Email (Never log OTP code or password)
      const mailResult = await this.mailService.sendAdminOtpEmail(user.email, otpCode, user.name);

      if (!mailResult.success) {
        // Strict Security: If email delivery fails, remove challenge and fail securely
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

        throw new BadRequestException(
          mailResult.configured
            ? 'Verification email could not be sent. Please try again in a few moments.'
            : 'Email OTP delivery is unavailable because email service is not configured. Please configure RESEND_API_KEY in server environment.',
        );
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

      // Minimum privilege temporary token for 2FA stage
      const pendingToken = jwt.sign(
        {
          sub: user._id,
          email: user.email,
          challengeId,
          type: 'PENDING_2FA',
        },
        secret,
        { expiresIn: '10m' },
      );

      return {
        requiresOtp: true,
        challengeId,
        maskedEmail: maskEmail(user.email),
        pendingToken,
        message: 'Security verification code dispatched to your registered email.',
      };
    }

    // Direct Login for Non-Admin Operational Roles (if configured)
    return this.completeLoginSession(user, ip, userAgent);
  }

  async verifyOtp(challengeId: string, otpCode: string, ip?: string, userAgent?: string) {
    if (!challengeId || !otpCode || otpCode.trim().length !== 6) {
      throw new BadRequestException('Please enter a valid 6-digit verification code.');
    }

    const cleanCode = otpCode.trim();
    const challenge = await this.challengeModel.findOne({
      challengeId,
      purpose: ChallengePurpose.ADMIN_LOGIN_OTP,
    });

    if (!challenge || challenge.isConsumed) {
      throw new BadRequestException('Invalid or already consumed verification session. Please sign in again.');
    }

    if (new Date() > challenge.expiresAt) {
      throw new BadRequestException('Verification code has expired. Please request a new code.');
    }

    if (challenge.attempts >= challenge.maxAttempts) {
      throw new BadRequestException('Too many invalid attempts. Please request a new code.');
    }

    // Increment attempts count
    challenge.attempts += 1;

    // Strict verification against bcrypt hash
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
      throw new BadRequestException('Invalid verification code.');
    }

    // Mark challenge as consumed (Single-Use Guarantee)
    challenge.isConsumed = true;
    challenge.consumedAt = new Date();
    await challenge.save();

    const user = await this.usersService.findById(challenge.userId.toString());
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account inactive or not found.');
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

  async resendOtp(challengeId: string, ip?: string, userAgent?: string) {
    const existing = await this.challengeModel.findOne({
      challengeId,
      purpose: ChallengePurpose.ADMIN_LOGIN_OTP,
    });

    if (!existing || existing.isConsumed) {
      throw new BadRequestException('Verification session expired. Please return to login.');
    }

    if (Date.now() < existing.resendAvailableAt.getTime()) {
      const wait = Math.ceil((existing.resendAvailableAt.getTime() - Date.now()) / 1000);
      throw new BadRequestException(`Please wait ${wait} seconds before requesting a new code.`);
    }

    // Invalidate old challenge immediately
    existing.isConsumed = true;
    existing.consumedAt = new Date();
    await existing.save();

    const user = await this.usersService.findById(existing.userId.toString());
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account no longer active.');
    }

    // Issue fresh challenge with new random OTP
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
      purpose: ChallengePurpose.ADMIN_LOGIN_OTP,
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
      throw new BadRequestException(
        mailResult.configured
          ? 'Verification email could not be sent. Please try again in a few moments.'
          : 'Email delivery is unavailable because email service is not configured in server environment.',
      );
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

  async forgotPassword(email: string, ip?: string, userAgent?: string) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const genericResponse = {
      success: true,
      message: 'If this email is registered, password reset instructions have been sent.',
    };

    if (!cleanEmail) return genericResponse;

    const user = await this.usersService.findByEmail(cleanEmail);
    if (!user || !user.isActive) {
      return genericResponse;
    }

    // Invalidate existing reset challenges for this email
    await this.challengeModel.updateMany(
      { email: cleanEmail, purpose: ChallengePurpose.PASSWORD_RESET, isConsumed: false },
      { isConsumed: true, consumedAt: new Date() },
    );

    const resetChallengeId = `rst_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const resetCode = crypto.randomInt(100000, 1000000).toString();
    const resetHash = await bcrypt.hash(resetCode, 10);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const resendAvailableAt = new Date(Date.now() + 30 * 1000);

    await this.challengeModel.create({
      challengeId: resetChallengeId,
      userId: user._id,
      email: cleanEmail,
      otpHash: resetHash,
      purpose: ChallengePurpose.PASSWORD_RESET,
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

  async resetPassword(
    payload: { email: string; resetCode: string; newPassword: string; challengeId?: string },
    ip?: string,
    userAgent?: string,
  ) {
    const { email, resetCode, newPassword, challengeId } = payload;
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanCode = String(resetCode || '').trim();

    if (!newPassword || newPassword.length < 12) {
      throw new BadRequestException('Password must be at least 12 characters.');
    }

    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);

    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      throw new BadRequestException(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol.',
      );
    }

    const query: any = {
      email: cleanEmail,
      purpose: ChallengePurpose.PASSWORD_RESET,
      isConsumed: false,
    };
    if (challengeId) query.challengeId = challengeId;

    const challenge = await this.challengeModel.findOne(query).sort({ createdAt: -1 });

    if (!challenge || challenge.isConsumed) {
      throw new BadRequestException('Invalid or expired password reset session.');
    }

    if (new Date() > challenge.expiresAt) {
      throw new BadRequestException('Password reset code has expired. Please request a new one.');
    }

    if (challenge.attempts >= challenge.maxAttempts) {
      throw new BadRequestException('Too many invalid attempts. Please request a new reset code.');
    }

    challenge.attempts += 1;

    const isMatch = await bcrypt.compare(cleanCode, challenge.otpHash);
    if (!isMatch) {
      await challenge.save();
      throw new BadRequestException('Invalid password reset code.');
    }

    // Mark challenge consumed (Single-Use Guarantee)
    challenge.isConsumed = true;
    challenge.consumedAt = new Date();
    await challenge.save();

    const user = await this.usersService.findByEmail(cleanEmail);
    if (!user) throw new BadRequestException('User not found.');

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

  private async completeLoginSession(user: any, ip?: string, userAgent?: string) {
    const secret = this.configService.get<string>('JWT_SECRET') || 'default_avelora_jwt_secret_key';
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') || `${secret}_refresh_2026_avelora`;

    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      permissions: user.permissions || [],
    };

    const token = jwt.sign(payload, secret, { expiresIn: '1d' });
    const refreshToken = jwt.sign(
      { sub: user._id, tokenVersion: user.tokenVersion || 1 },
      refreshSecret,
      { expiresIn: '7d' },
    );

    // Update user lastLogin timestamp
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

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required.');
    }
    const secret = this.configService.get<string>('JWT_SECRET') || 'default_avelora_jwt_secret_key';
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') || `${secret}_refresh_2026_avelora`;

    try {
      const decoded = jwt.verify(refreshToken, refreshSecret) as any;
      const user = await this.usersService.findById(decoded.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User account no longer active.');
      }
      return this.completeLoginSession(user);
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }

  async changePassword(userId: string, currentPass: string, newPass: string, ip?: string, userAgent?: string) {
    if (!currentPass || !newPass) {
      throw new BadRequestException('Current and new password are required.');
    }
    if (newPass.length < 12) {
      throw new BadRequestException('New password must be at least 12 characters.');
    }
    const user = await this.usersService.findByEmailOrId(userId);
    if (!user) {
      throw new BadRequestException('User not found.');
    }
    const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Current password does not match.');
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

  async logout(token?: string, userId?: string, ip?: string, userAgent?: string) {
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

  isTokenRevoked(token: string): boolean {
    return this.revokedTokens.has(token);
  }
}
