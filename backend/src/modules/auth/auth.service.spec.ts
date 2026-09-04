import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuthChallenge, ChallengePurpose } from '../../schemas/auth-challenge.schema';
import { UserRole } from '../../schemas/user.schema';
import * as bcrypt from 'bcrypt';

describe('AuthService - Admin 2FA Email OTP & Security Verification', () => {
  let service: AuthService;
  let mockChallengeModel: any;
  let mockUsersService: any;
  let mockMailService: any;
  let mockAuditLogService: any;

  const mockAdminUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Super Admin',
    email: 'aveloraelegance@gmail.com',
    role: UserRole.SUPER_ADMIN,
    isActive: true,
    passwordHash: '$2b$10$abcdefghijklmnopqrstuv',
  };

  beforeEach(async () => {
    mockChallengeModel = {
      create: jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn() })),
      findOne: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    };

    mockUsersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      updateLastLogin: jest.fn().mockResolvedValue(true),
    };

    mockMailService = {
      sendAdminOtpEmail: jest.fn().mockResolvedValue({ success: true, message: 'Sent', configured: true }),
      sendPasswordResetEmail: jest.fn().mockResolvedValue({ success: true, message: 'Sent', configured: true }),
      isConfigured: jest.fn().mockReturnValue(true),
    };

    mockAuditLogService = {
      logAction: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'JWT_SECRET') return 'super_secret_jwt_key_avelora_2026';
              return null;
            }),
          },
        },
        { provide: MailService, useValue: mockMailService },
        { provide: AuditLogService, useValue: mockAuditLogService },
        { provide: getModelToken(AuthChallenge.name), useValue: mockChallengeModel },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('1. initiateLogin: generates cryptographic OTP, hashes it, stores hash in DB, and dispatches email', async () => {
    const result: any = await service.initiateLogin(mockAdminUser, '127.0.0.1', 'JestTest');

    expect(result.requiresOtp).toBe(true);
    expect(result.challengeId).toBeDefined();
    expect(result.pendingToken).toBeDefined();

    // Verify DB creation stored a bcrypt hash, NEVER plaintext OTP
    expect(mockChallengeModel.create).toHaveBeenCalledTimes(1);
    const createdChallenge = mockChallengeModel.create.mock.calls[0][0];
    expect(createdChallenge.otpHash).toBeDefined();
    expect(createdChallenge.otpHash.startsWith('$2b$')).toBe(true); // Valid bcrypt hash
    expect(createdChallenge.purpose).toBe(ChallengePurpose.ADMIN_LOGIN_OTP);

    // Verify MailService called with actual 6-digit plain OTP in memory
    expect(mockMailService.sendAdminOtpEmail).toHaveBeenCalledTimes(1);
    const sentArgs = mockMailService.sendAdminOtpEmail.mock.calls[0];
    expect(sentArgs[0]).toBe(mockAdminUser.email);
    expect(sentArgs[1]).toMatch(/^\d{6}$/); // 6-digit number
  });

  it('2. initiateLogin: fails securely without bypass if email delivery fails', async () => {
    mockMailService.sendAdminOtpEmail.mockResolvedValueOnce({
      success: false,
      message: 'SMTP transport offline',
      configured: true,
    });

    await expect(service.initiateLogin(mockAdminUser, '127.0.0.1', 'JestTest')).rejects.toThrow(
      BadRequestException,
    );

    // Verify created challenge was deleted from DB to prevent dangling challenges
    expect(mockChallengeModel.deleteOne).toHaveBeenCalled();
  });

  it('3. verifyOtp: successfully verifies valid plain OTP against stored hash', async () => {
    const plainOtp = '849201';
    const otpHash = await bcrypt.hash(plainOtp, 10);

    const mockChallengeDoc = {
      challengeId: 'chl_123',
      userId: mockAdminUser._id,
      email: mockAdminUser.email,
      otpHash,
      purpose: ChallengePurpose.ADMIN_LOGIN_OTP,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // Valid
      attempts: 0,
      maxAttempts: 5,
      isConsumed: false,
      save: jest.fn().mockResolvedValue(true),
    };

    mockChallengeModel.findOne.mockResolvedValue(mockChallengeDoc);
    mockUsersService.findById.mockResolvedValue(mockAdminUser);

    const result = await service.verifyOtp('chl_123', plainOtp, '127.0.0.1', 'JestTest');

    expect(result.token).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.email).toBe(mockAdminUser.email);
    expect(mockChallengeDoc.isConsumed).toBe(true); // Marked consumed (Single use)
    expect(mockChallengeDoc.save).toHaveBeenCalled();
  });

  it('4. verifyOtp: rejects incorrect OTP code and increments attempts', async () => {
    const plainOtp = '849201';
    const otpHash = await bcrypt.hash(plainOtp, 10);

    const mockChallengeDoc = {
      challengeId: 'chl_123',
      userId: mockAdminUser._id,
      email: mockAdminUser.email,
      otpHash,
      purpose: ChallengePurpose.ADMIN_LOGIN_OTP,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attempts: 0,
      maxAttempts: 5,
      isConsumed: false,
      save: jest.fn().mockResolvedValue(true),
    };

    mockChallengeModel.findOne.mockResolvedValue(mockChallengeDoc);

    // Entering wrong OTP '123456'
    await expect(service.verifyOtp('chl_123', '123456', '127.0.0.1', 'JestTest')).rejects.toThrow(
      BadRequestException,
    );

    expect(mockChallengeDoc.attempts).toBe(1);
    expect(mockChallengeDoc.isConsumed).toBe(false);
    expect(mockChallengeDoc.save).toHaveBeenCalled();
  });

  it('5. verifyOtp: rejects expired OTP (>5 minutes)', async () => {
    const plainOtp = '849201';
    const otpHash = await bcrypt.hash(plainOtp, 10);

    const mockChallengeDoc = {
      challengeId: 'chl_123',
      userId: mockAdminUser._id,
      email: mockAdminUser.email,
      otpHash,
      purpose: ChallengePurpose.ADMIN_LOGIN_OTP,
      expiresAt: new Date(Date.now() - 1000), // Expired
      attempts: 0,
      maxAttempts: 5,
      isConsumed: false,
      save: jest.fn(),
    };

    mockChallengeModel.findOne.mockResolvedValue(mockChallengeDoc);

    await expect(service.verifyOtp('chl_123', plainOtp, '127.0.0.1', 'JestTest')).rejects.toThrow(
      'Verification code has expired. Please request a new code.',
    );
  });

  it('6. verifyOtp: rejects already consumed OTP (single-use guarantee)', async () => {
    const plainOtp = '849201';
    const otpHash = await bcrypt.hash(plainOtp, 10);

    const mockChallengeDoc = {
      challengeId: 'chl_123',
      userId: mockAdminUser._id,
      email: mockAdminUser.email,
      otpHash,
      purpose: ChallengePurpose.ADMIN_LOGIN_OTP,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attempts: 1,
      maxAttempts: 5,
      isConsumed: true, // Already consumed
      save: jest.fn(),
    };

    mockChallengeModel.findOne.mockResolvedValue(mockChallengeDoc);

    await expect(service.verifyOtp('chl_123', plainOtp, '127.0.0.1', 'JestTest')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('7. verifyOtp: rejects when maximum attempts (5) reached', async () => {
    const plainOtp = '849201';
    const otpHash = await bcrypt.hash(plainOtp, 10);

    const mockChallengeDoc = {
      challengeId: 'chl_123',
      userId: mockAdminUser._id,
      email: mockAdminUser.email,
      otpHash,
      purpose: ChallengePurpose.ADMIN_LOGIN_OTP,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attempts: 5, // Maxed out
      maxAttempts: 5,
      isConsumed: false,
      save: jest.fn(),
    };

    mockChallengeModel.findOne.mockResolvedValue(mockChallengeDoc);

    await expect(service.verifyOtp('chl_123', plainOtp, '127.0.0.1', 'JestTest')).rejects.toThrow(
      'Too many invalid attempts. Please request a new code.',
    );
  });

  it('8. resendOtp: invalidates previous challenge and creates a new random OTP', async () => {
    const oldChallengeDoc = {
      challengeId: 'chl_old',
      userId: mockAdminUser._id,
      email: mockAdminUser.email,
      otpHash: 'old_hash',
      purpose: ChallengePurpose.ADMIN_LOGIN_OTP,
      resendAvailableAt: new Date(Date.now() - 1000), // Cooldown passed
      isConsumed: false,
      save: jest.fn().mockResolvedValue(true),
    };

    mockChallengeModel.findOne.mockResolvedValue(oldChallengeDoc);
    mockUsersService.findById.mockResolvedValue(mockAdminUser);

    const result = await service.resendOtp('chl_old', '127.0.0.1', 'JestTest');

    expect(result.challengeId).toBeDefined();
    expect(result.challengeId).not.toBe('chl_old');
    expect(oldChallengeDoc.isConsumed).toBe(true); // Old challenge invalidated
    expect(mockChallengeModel.create).toHaveBeenCalledTimes(1);
    expect(mockMailService.sendAdminOtpEmail).toHaveBeenCalledTimes(1);
  });
});
