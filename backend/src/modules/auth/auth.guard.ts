import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    let token = request.cookies?.token;

    // Check Authorization: Bearer <token> header for robust cross-domain API compatibility
    if (!token && request.headers?.authorization) {
      const authHeader = request.headers.authorization;
      if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      }
    }

    if (!token) {
      throw new UnauthorizedException('No auth token found');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET') as string;
      const decoded: any = jwt.verify(token, secret);

      // Minimum privilege enforcement: Tokens pending 2FA OTP verification cannot access protected admin routes
      if (decoded.type === 'PENDING_2FA') {
        throw new UnauthorizedException('Two-factor OTP verification required to access this resource.');
      }

      if (decoded.type !== 'ACCESS') {
        throw new UnauthorizedException('Invalid token type.');
      }

      request.user = decoded;
      return true;
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired authentication session.');
    }
  }
}
