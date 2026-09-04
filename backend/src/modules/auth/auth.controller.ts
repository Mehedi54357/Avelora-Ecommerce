import { Controller, Post, Body, Res, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import type { Response, Request } from 'express';
import { AuthGuard } from './auth.guard';

function extractClientInfo(req: Request) {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown';
  return { ip, userAgent };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private getCookieOptions() {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    const secure = this.configService.get<string>('COOKIE_SECURE') === 'true' || isProd;
    const sameSite =
      (this.configService.get<string>('COOKIE_SAME_SITE') as 'lax' | 'none' | 'strict') ||
      (isProd ? 'none' : 'lax');
    const domain = this.configService.get<string>('COOKIE_DOMAIN') || undefined;

    return {
      httpOnly: true,
      secure,
      sameSite,
      domain: domain && domain.trim() !== '' ? domain : undefined,
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    };
  }

  @Post('login')
  async login(
    @Body() body: any,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { ip, userAgent } = extractClientInfo(req);
    const user = await this.authService.validateUser(body.email, body.password, ip, userAgent);
    const result = await this.authService.initiateLogin(user, ip, userAgent);

    if ('token' in result && (result as any).token) {
      const cookieOptions = this.getCookieOptions();
      try {
        res.cookie('token', (result as any).token, cookieOptions);
      } catch {}
    }

    return result;
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body() body: { challengeId: string; otpCode: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { ip, userAgent } = extractClientInfo(req);
    const result = await this.authService.verifyOtp(body.challengeId, body.otpCode, ip, userAgent);

    if (result.token) {
      const cookieOptions = this.getCookieOptions();
      try {
        res.cookie('token', result.token, cookieOptions);
      } catch {}
    }

    return result;
  }

  @Post('resend-otp')
  async resendOtp(@Body() body: { challengeId: string }, @Req() req: Request) {
    const { ip, userAgent } = extractClientInfo(req);
    return this.authService.resendOtp(body.challengeId, ip, userAgent);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }, @Req() req: Request) {
    const { ip, userAgent } = extractClientInfo(req);
    return this.authService.forgotPassword(body.email, ip, userAgent);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: any, @Req() req: Request) {
    const { ip, userAgent } = extractClientInfo(req);
    return this.authService.resetPassword(body, ip, userAgent);
  }

  @Post('logout')
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { ip, userAgent } = extractClientInfo(req);
    const cookieOptions = this.getCookieOptions();
    res.clearCookie('token', {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      domain: cookieOptions.domain,
      path: '/',
    });

    const token = req.cookies?.token;
    const adminId = req.user?.sub;
    return this.authService.logout(token, adminId, ip, userAgent);
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body?.refreshToken);
  }

  @UseGuards(AuthGuard)
  @Post('change-password')
  async changePassword(@Req() req: any, @Body() body: any) {
    const userId = req.user.sub;
    return this.authService.changePassword(userId, body.currentPassword, body.newPassword);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(@Req() req: any) {
    return {
      user: {
        id: req.user.sub,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
      },
    };
  }
}
