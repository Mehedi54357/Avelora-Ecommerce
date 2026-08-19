import { Controller, Post, Body, Res, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthGuard } from './auth.guard';

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
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(body.email, body.password);
    const { token, user: userData } = await this.authService.login(user);

    const cookieOptions = this.getCookieOptions();
    try {
      res.cookie('token', token, cookieOptions);
    } catch {}

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

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
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

