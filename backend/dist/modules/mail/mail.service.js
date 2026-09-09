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
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
const resend_1 = require("resend");
function maskEmail(email) {
    if (!email || !email.includes('@'))
        return '******';
    const [user, domain] = email.split('@');
    if (user.length <= 2)
        return `${user[0]}*@${domain}`;
    return `${user[0]}${'*'.repeat(Math.min(user.length - 2, 6))}${user[user.length - 1]}@${domain}`;
}
let MailService = MailService_1 = class MailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(MailService_1.name);
        this.resend = null;
        this.smtpTransporter = null;
        this.isVerified = false;
        this.transportType = 'none';
        this.initTransporters();
    }
    async onModuleInit() {
        this.verifyTransporters();
    }
    initTransporters() {
        const resendApiKey = this.configService.get('RESEND_API_KEY')?.trim();
        const smtpHost = this.configService.get('SMTP_HOST')?.trim();
        const smtpUser = (this.configService.get('SMTP_USER') || this.configService.get('GMAIL_USER'))?.trim();
        const smtpPass = (this.configService.get('SMTP_PASS') || this.configService.get('GMAIL_APP_PASSWORD'))?.trim();
        const smtpPort = parseInt(this.configService.get('SMTP_PORT') || '587', 10);
        const smtpSecure = this.configService.get('SMTP_SECURE') === 'true' || smtpPort === 465;
        if (resendApiKey && resendApiKey.length > 0) {
            this.resend = new resend_1.Resend(resendApiKey);
            this.transportType = 'resend';
            this.isVerified = true;
        }
        else if (smtpUser && smtpPass) {
            this.smtpTransporter = nodemailer.createTransport({
                host: smtpHost || 'smtp.gmail.com',
                port: smtpPort,
                secure: smtpSecure,
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
            });
            this.transportType = 'smtp';
            this.isVerified = true;
        }
        else {
            this.resend = null;
            this.smtpTransporter = null;
            this.transportType = 'none';
            this.isVerified = false;
        }
    }
    verifyTransporters() {
        if (this.transportType === 'resend') {
            this.logger.log('Email transport: Resend HTTPS API configured');
        }
        else if (this.transportType === 'smtp') {
            this.logger.log('Email transport: Nodemailer SMTP configured');
        }
        else {
            const nodeEnv = this.configService.get('NODE_ENV');
            if (nodeEnv === 'production') {
                this.logger.warn('Email transport: NOT configured (RESEND_API_KEY or SMTP credentials missing)');
            }
            else {
                this.logger.log('Email transport: Development Mode (OTP codes will be displayed in server console)');
            }
        }
    }
    isConfigured() {
        return this.isVerified && this.transportType !== 'none';
    }
    isDevMode() {
        const nodeEnv = (this.configService.get('NODE_ENV') || process.env.NODE_ENV || 'development').toLowerCase();
        return nodeEnv !== 'production';
    }
    printDevOtpBanner(toEmail, otpCode, type) {
        const title = type === 'LOGIN' ? 'ADMIN LOGIN 2FA OTP' : 'PASSWORD RESET CODE';
        const border = '═'.repeat(60);
        console.log('\n' + border);
        console.log(`🔐 [AVELORA DEV SECURITY] ${title}`);
        console.log(border);
        console.log(`📧 Recipient Email : ${toEmail}`);
        console.log(`🔑 Verification Code: ${otpCode}`);
        console.log(`⏳ Expiration       : 5 Minutes`);
        console.log(`💡 Note             : In production, configure RESEND_API_KEY or SMTP in .env`);
        console.log(border + '\n');
    }
    async sendAdminOtpEmail(toEmail, otpCode, adminName = 'Administrator') {
        if (!this.isConfigured()) {
            if (this.isDevMode()) {
                this.printDevOtpBanner(toEmail, otpCode, 'LOGIN');
                this.logger.log(`[DevMode] Admin OTP code logged to console for ${maskEmail(toEmail)}`);
                return {
                    success: true,
                    message: 'Development Mode: Verification code generated and logged to backend console.',
                    configured: false,
                };
            }
            this.logger.warn(`[MailService] Attempted to send Admin OTP to ${maskEmail(toEmail)}, but no email service is configured.`);
            return {
                success: false,
                message: 'Email service not configured — verification email could not be dispatched.',
                configured: false,
            };
        }
        const defaultFrom = this.transportType === 'smtp'
            ? (this.configService.get('SMTP_USER') || this.configService.get('GMAIL_USER') || 'no-reply@avelora.com')
            : 'onboarding@resend.dev';
        const from = this.configService.get('MAIL_FROM') || `AVELORA Security <${defaultFrom}>`;
        const subject = 'AVELORA Admin Verification Code';
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AVELORA Admin Security Verification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0F19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FAFAF8;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0B0F19; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #111827; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          
          <!-- Header Branding -->
          <tr>
            <td style="padding: 36px 32px 24px; text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.2); background: linear-gradient(180deg, #161F30 0%, #111827 100%);">
              <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; letter-spacing: 0.3em; color: #FAFAF8; text-transform: uppercase;">AVELORA</h1>
              <p style="margin: 6px 0 0; font-size: 10px; letter-spacing: 0.35em; color: #D4AF37; text-transform: uppercase; font-weight: 700;">ELEGANCE &bull; ADMIN SECURITY</p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 32px; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #9CA3AF;">Dear ${adminName},</p>
              <h2 style="margin: 0 0 16px; font-size: 19px; font-weight: 700; color: #FAFAF8;">Your verification code:</h2>
              <p style="margin: 0 0 28px; font-size: 13px; line-height: 1.5; color: #9CA3AF;">
                Use the one-time verification code below to complete your secure administration sign-in:
              </p>
              
              <!-- High-Security OTP Box -->
              <div style="background-color: #0B0F19; border: 1px solid rgba(212, 175, 55, 0.5); border-radius: 12px; padding: 22px 0; margin: 0 auto 28px; max-width: 320px; box-shadow: inset 0 2px 8px rgba(0,0,0,0.5);">
                <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 800; letter-spacing: 0.4em; color: #D4AF37; text-shadow: 0 0 14px rgba(212, 175, 55, 0.35); padding-left: 0.4em;">${otpCode}</span>
              </div>

              <!-- Expiry & Security Notice -->
              <p style="margin: 0 0 8px; font-size: 13px; color: #E5E7EB; font-weight: 600;">
                This code expires in <strong style="color: #D4AF37;">5 minutes</strong>.
              </p>
              <p style="margin: 0 0 24px; font-size: 12px; color: #EF4444; font-weight: 500;">
                Never share this verification code with anyone.
              </p>

              <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 22px;">
                <p style="margin: 0; font-size: 11px; color: #6B7280; line-height: 1.5;">
                  If you did not attempt to sign in to AVELORA Administration, please ignore this email and review your account security immediately.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 22px 32px; text-align: center; background-color: #0B0F19; border-top: 1px solid rgba(255, 255, 255, 0.06);">
              <p style="margin: 0; font-size: 10px; letter-spacing: 0.2em; color: #6B7280; text-transform: uppercase;">
                AVELORA ELEGANCE &bull; SECURE ADMINISTRATION PORTAL
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
        if (this.transportType === 'resend' && this.resend) {
            try {
                const { data, error } = await this.resend.emails.send({
                    from,
                    to: [toEmail],
                    subject,
                    html,
                });
                if (error) {
                    this.logger.error(`[MailService] Failed to send OTP email via Resend to ${maskEmail(toEmail)}: ${error.message || JSON.stringify(error)}`);
                    return {
                        success: false,
                        message: 'Verification email could not be sent. Please check your email configuration.',
                        configured: true,
                    };
                }
                this.logger.log(`[MailService] OTP email successfully dispatched via Resend to ${maskEmail(toEmail)} (id: ${data?.id || 'ack'})`);
                return {
                    success: true,
                    message: 'Verification code dispatched to your registered email.',
                    configured: true,
                };
            }
            catch (err) {
                this.logger.error(`[MailService] Exception sending OTP email via Resend to ${maskEmail(toEmail)}: ${err.message}`);
                return {
                    success: false,
                    message: 'Verification email could not be sent. Please check your email configuration.',
                    configured: true,
                };
            }
        }
        if (this.transportType === 'smtp' && this.smtpTransporter) {
            try {
                const info = await this.smtpTransporter.sendMail({
                    from,
                    to: toEmail,
                    subject,
                    html,
                });
                this.logger.log(`[MailService] OTP email successfully dispatched via SMTP to ${maskEmail(toEmail)} (messageId: ${info.messageId})`);
                return {
                    success: true,
                    message: 'Verification code dispatched to your registered email.',
                    configured: true,
                };
            }
            catch (err) {
                this.logger.error(`[MailService] Exception sending OTP email via SMTP to ${maskEmail(toEmail)}: ${err.message}`);
                return {
                    success: false,
                    message: 'Verification email could not be sent via SMTP. Please verify SMTP credentials.',
                    configured: true,
                };
            }
        }
        return {
            success: false,
            message: 'Email service unavailable.',
            configured: false,
        };
    }
    async sendPasswordResetEmail(toEmail, resetCode, adminName = 'Administrator') {
        if (!this.isConfigured()) {
            if (this.isDevMode()) {
                this.printDevOtpBanner(toEmail, resetCode, 'PASSWORD_RESET');
                this.logger.log(`[DevMode] Password reset code logged to console for ${maskEmail(toEmail)}`);
                return {
                    success: true,
                    message: 'Development Mode: Password reset code generated and logged to backend console.',
                    configured: false,
                };
            }
            this.logger.warn(`[MailService] Attempted to send Password Reset to ${maskEmail(toEmail)}, but no email service is configured.`);
            return {
                success: false,
                message: 'Email service not configured — email delivery unavailable.',
                configured: false,
            };
        }
        const defaultFrom = this.transportType === 'smtp'
            ? (this.configService.get('SMTP_USER') || this.configService.get('GMAIL_USER') || 'no-reply@avelora.com')
            : 'onboarding@resend.dev';
        const from = this.configService.get('MAIL_FROM') || `AVELORA Security <${defaultFrom}>`;
        const subject = 'AVELORA Password Reset Code';
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>AVELORA Password Reset</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0F19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FAFAF8;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0B0F19; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #111827; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="padding: 36px 32px 24px; text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.2); background: linear-gradient(180deg, #161F30 0%, #111827 100%);">
              <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; letter-spacing: 0.3em; color: #FAFAF8;">AVELORA</h1>
              <p style="margin: 6px 0 0; font-size: 10px; letter-spacing: 0.35em; color: #D4AF37; text-transform: uppercase; font-weight: 700;">PASSWORD RESET</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 32px; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #9CA3AF;">Dear ${adminName},</p>
              <h2 style="margin: 0 0 16px; font-size: 19px; font-weight: 700; color: #FAFAF8;">Reset Your Password</h2>
              <p style="margin: 0 0 28px; font-size: 13px; line-height: 1.5; color: #9CA3AF;">Use this verification code to set a new secure password for your account:</p>
              
              <div style="background-color: #0B0F19; border: 1px solid rgba(212, 175, 55, 0.5); border-radius: 12px; padding: 22px 0; margin: 0 auto 28px; max-width: 320px;">
                <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 800; letter-spacing: 0.4em; color: #D4AF37; padding-left: 0.4em;">${resetCode}</span>
              </div>

              <p style="margin: 0 0 8px; font-size: 13px; color: #E5E7EB; font-weight: 600;">This code expires in <strong style="color: #D4AF37;">10 minutes</strong>.</p>
              <p style="margin: 0 0 24px; font-size: 12px; color: #6B7280;">If you did not request a password reset, please secure your account immediately.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 22px 32px; text-align: center; background-color: #0B0F19; border-top: 1px solid rgba(255, 255, 255, 0.06);">
              <p style="margin: 0; font-size: 10px; letter-spacing: 0.2em; color: #6B7280; text-transform: uppercase;">
                AVELORA ELEGANCE &bull; SECURE ADMINISTRATION PORTAL
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
        if (this.transportType === 'resend' && this.resend) {
            try {
                const { data, error } = await this.resend.emails.send({
                    from,
                    to: [toEmail],
                    subject,
                    html,
                });
                if (error) {
                    this.logger.error(`[MailService] Failed to send reset email via Resend to ${maskEmail(toEmail)}: ${error.message || JSON.stringify(error)}`);
                    return {
                        success: false,
                        message: 'Password reset email could not be sent. Please check your email configuration.',
                        configured: true,
                    };
                }
                this.logger.log(`[MailService] Password reset email dispatched via Resend to ${maskEmail(toEmail)} (id: ${data?.id || 'ack'})`);
                return {
                    success: true,
                    message: 'Password reset instructions sent to your email.',
                    configured: true,
                };
            }
            catch (err) {
                this.logger.error(`[MailService] Exception sending reset email via Resend to ${maskEmail(toEmail)}: ${err.message}`);
                return {
                    success: false,
                    message: 'Password reset email could not be sent. Please check your email configuration.',
                    configured: true,
                };
            }
        }
        if (this.transportType === 'smtp' && this.smtpTransporter) {
            try {
                const info = await this.smtpTransporter.sendMail({
                    from,
                    to: toEmail,
                    subject,
                    html,
                });
                this.logger.log(`[MailService] Password reset email dispatched via SMTP to ${maskEmail(toEmail)} (messageId: ${info.messageId})`);
                return {
                    success: true,
                    message: 'Password reset instructions sent to your email.',
                    configured: true,
                };
            }
            catch (err) {
                this.logger.error(`[MailService] Exception sending reset email via SMTP to ${maskEmail(toEmail)}: ${err.message}`);
                return {
                    success: false,
                    message: 'Password reset email could not be sent via SMTP. Please verify SMTP credentials.',
                    configured: true,
                };
            }
        }
        return {
            success: false,
            message: 'Email service unavailable.',
            configured: false,
        };
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map