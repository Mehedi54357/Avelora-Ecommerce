import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '******';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}*@${domain}`;
  return `${user[0]}${'*'.repeat(Math.min(user.length - 2, 6))}${user[user.length - 1]}@${domain}`;
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null = null;
  private isVerified: boolean = false;

  constructor(private readonly configService: ConfigService) {
    this.initResend();
  }

  async onModuleInit() {
    this.verifyResend();
  }

  private initResend() {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (apiKey && apiKey.trim().length > 0) {
      this.resend = new Resend(apiKey.trim());
      this.isVerified = true;
    } else {
      this.resend = null;
      this.isVerified = false;
    }
  }

  private verifyResend() {
    if (this.resend && this.isVerified) {
      this.logger.log('Email transport: Resend configured');
    } else {
      this.logger.warn('Email transport: NOT configured (RESEND_API_KEY missing)');
    }
  }

  isConfigured(): boolean {
    return this.resend !== null && this.isVerified;
  }

  async sendAdminOtpEmail(
    toEmail: string,
    otpCode: string,
    adminName: string = 'Administrator',
  ): Promise<{ success: boolean; message: string; configured: boolean }> {
    if (!this.resend) {
      this.logger.warn(
        `[MailService] Attempted to send Admin OTP to ${maskEmail(toEmail)}, but Resend is not configured.`,
      );
      return {
        success: false,
        message: 'Email service not configured — verification email could not be dispatched.',
        configured: false,
      };
    }

    const from =
      this.configService.get<string>('MAIL_FROM') || 'AVELORA Security <onboarding@resend.dev>';
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

    try {
      const { data, error } = await this.resend.emails.send({
        from,
        to: [toEmail],
        subject,
        html,
      });

      if (error) {
        this.logger.error(
          `[MailService] Failed to send OTP email via Resend to ${maskEmail(toEmail)}: ${error.message || JSON.stringify(error)}`,
        );
        return {
          success: false,
          message: 'Verification email could not be sent. Please try again.',
          configured: true,
        };
      }

      this.logger.log(
        `[MailService] OTP email successfully dispatched via Resend to ${maskEmail(toEmail)} (id: ${data?.id || 'ack'})`,
      );
      return {
        success: true,
        message: 'Verification code dispatched to your registered email.',
        configured: true,
      };
    } catch (err: any) {
      this.logger.error(
        `[MailService] Exception sending OTP email via Resend to ${maskEmail(toEmail)}: ${err.message}`,
      );
      return {
        success: false,
        message: 'Verification email could not be sent. Please try again.',
        configured: true,
      };
    }
  }

  async sendPasswordResetEmail(
    toEmail: string,
    resetCode: string,
    adminName: string = 'Administrator',
  ): Promise<{ success: boolean; message: string; configured: boolean }> {
    if (!this.resend) {
      this.logger.warn(
        `[MailService] Attempted to send Password Reset to ${maskEmail(toEmail)}, but Resend is not configured.`,
      );
      return {
        success: false,
        message: 'Email service not configured — email delivery unavailable.',
        configured: false,
      };
    }

    const from =
      this.configService.get<string>('MAIL_FROM') || 'AVELORA Security <onboarding@resend.dev>';
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

    try {
      const { data, error } = await this.resend.emails.send({
        from,
        to: [toEmail],
        subject,
        html,
      });

      if (error) {
        this.logger.error(
          `[MailService] Failed to send reset email via Resend to ${maskEmail(toEmail)}: ${error.message || JSON.stringify(error)}`,
        );
        return {
          success: false,
          message: 'Password reset email could not be sent. Please try again.',
          configured: true,
        };
      }

      this.logger.log(
        `[MailService] Password reset email dispatched via Resend to ${maskEmail(toEmail)} (id: ${data?.id || 'ack'})`,
      );
      return {
        success: true,
        message: 'Password reset instructions sent to your email.',
        configured: true,
      };
    } catch (err: any) {
      this.logger.error(
        `[MailService] Exception sending reset email via Resend to ${maskEmail(toEmail)}: ${err.message}`,
      );
      return {
        success: false,
        message: 'Password reset email could not be sent. Please try again.',
        configured: true,
      };
    }
  }
}
