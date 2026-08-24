import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // In-memory or database token revocation set
  private revokedTokens = new Set<string>();

  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.isActive) {
      const isMatch = await bcrypt.compare(pass, user.passwordHash);
      if (isMatch) {
        const { passwordHash, ...result } = user.toObject();
        return result;
      }
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: any) {
    const secret = this.configService.get<string>('JWT_SECRET') || 'default_avelora_jwt_secret_key';
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'default_avelora_refresh_secret_key';

    const accessPayload = {
      email: user.email,
      sub: user._id,
      role: user.role,
      name: user.name,
      type: 'ACCESS',
    };

    const refreshPayload = {
      sub: user._id,
      type: 'REFRESH',
      jti: `rt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    };

    const accessToken = jwt.sign(accessPayload, secret, { expiresIn: '1h' });
    const refreshToken = jwt.sign(refreshPayload, refreshSecret, { expiresIn: '7d' });

    return {
      token: accessToken,
      accessToken,
      refreshToken,
      expiresIn: 3600,
      user,
    };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken || this.revokedTokens.has(refreshToken)) {
      throw new UnauthorizedException('Invalid or revoked refresh token');
    }

    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'default_avelora_refresh_secret_key';
    const secret = this.configService.get<string>('JWT_SECRET') || 'default_avelora_jwt_secret_key';

    try {
      const decoded: any = jwt.verify(refreshToken, refreshSecret);
      const user = await this.usersService.findById(decoded.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User no longer active');
      }

      // Rotate: Revoke previous refresh token
      this.revokedTokens.add(refreshToken);

      const accessPayload = {
        email: user.email,
        sub: user._id,
        role: user.role,
        name: user.name,
        type: 'ACCESS',
      };

      const newRefreshPayload = {
        sub: user._id,
        type: 'REFRESH',
        jti: `rt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      };

      const newAccessToken = jwt.sign(accessPayload, secret, { expiresIn: '1h' });
      const newRefreshToken = jwt.sign(newRefreshPayload, refreshSecret, { expiresIn: '7d' });

      return {
        token: newAccessToken,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 3600,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch (err: any) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(token?: string, refreshToken?: string) {
    if (token) this.revokedTokens.add(token);
    if (refreshToken) this.revokedTokens.add(refreshToken);
    return { success: true, message: 'Logged out successfully' };
  }

  async changePassword(userId: string, oldPass: string, newPass: string) {
    if (!newPass || newPass.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters');
    }

    const user = await this.usersService.findByEmailOrId(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const isMatch = await bcrypt.compare(oldPass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Current password does not match');
    }

    const newHash = await bcrypt.hash(newPass, 10);
    user.passwordHash = newHash;
    await user.save();

    return { success: true, message: 'Password updated successfully' };
  }
}
