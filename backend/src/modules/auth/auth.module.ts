import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { AuthChallenge, AuthChallengeSchema } from '../../schemas/auth-challenge.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AuthChallenge.name, schema: AuthChallengeSchema }]),
    UsersModule,
    AuditLogModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
