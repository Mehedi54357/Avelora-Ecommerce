import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { Resend } from 'resend';

jest.mock('resend');

describe('MailService - Resend HTTPS API Integration', () => {
  let service: MailService;
  let mockEmailsSend: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEmailsSend = jest.fn().mockResolvedValue({
      data: { id: 're_123456789' },
      error: null,
    });

    (Resend as unknown as jest.Mock).mockImplementation(() => ({
      emails: {
        send: mockEmailsSend,
      },
    }));
  });

  it('1. Initializes Resend client and logs configured when RESEND_API_KEY is present', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'RESEND_API_KEY') return 're_test_key_12345';
              if (key === 'MAIL_FROM') return 'AVELORA Security <security@avelora.com>';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    await service.onModuleInit();

    expect(Resend).toHaveBeenCalledWith('re_test_key_12345');
    expect(service.isConfigured()).toBe(true);
  });

  it('2. Gracefully handles missing RESEND_API_KEY without throwing errors', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(null),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    await service.onModuleInit();

    expect(service.isConfigured()).toBe(false);

    const result = await service.sendAdminOtpEmail('admin@avelora.com', '123456');
    expect(result.success).toBe(false);
    expect(result.configured).toBe(false);
  });

  it('3. Successfully sends Admin Login OTP email with custom MAIL_FROM', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'RESEND_API_KEY') return 're_test_key_12345';
              if (key === 'MAIL_FROM') return 'AVELORA Security <security@avelora.com>';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    await service.onModuleInit();

    const result = await service.sendAdminOtpEmail('admin@avelora.com', '789123', 'Super Admin');

    expect(result.success).toBe(true);
    expect(mockEmailsSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'AVELORA Security <security@avelora.com>',
        to: ['admin@avelora.com'],
        subject: 'AVELORA Admin Verification Code',
      }),
    );

    const callPayload = mockEmailsSend.mock.calls[0][0];
    expect(callPayload.html).toContain('789123');
    expect(callPayload.html).toContain('Super Admin');
    expect(callPayload.html).toContain('AVELORA');
    expect(callPayload.html).toContain('5 minutes');
  });

  it('4. Successfully sends Password Reset OTP email with custom MAIL_FROM', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'RESEND_API_KEY') return 're_test_key_12345';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    await service.onModuleInit();

    const result = await service.sendPasswordResetEmail('admin@avelora.com', '456789', 'Admin');

    expect(result.success).toBe(true);
    expect(mockEmailsSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'AVELORA Security <onboarding@resend.dev>',
        to: ['admin@avelora.com'],
        subject: 'AVELORA Password Reset Code',
      }),
    );

    const callPayload = mockEmailsSend.mock.calls[0][0];
    expect(callPayload.html).toContain('456789');
    expect(callPayload.html).toContain('10 minutes');
  });

  it('5. Fails securely and returns error when Resend API returns an error object', async () => {
    mockEmailsSend.mockResolvedValueOnce({
      data: null,
      error: { message: 'Domain not verified or rate limit reached', name: 'validation_error' },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'RESEND_API_KEY') return 're_test_key_12345';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    await service.onModuleInit();

    const result = await service.sendAdminOtpEmail('admin@avelora.com', '112233');

    expect(result.success).toBe(false);
    expect(result.configured).toBe(true);
  });

  it('6. Fails securely when Resend API throws an unexpected network exception', async () => {
    mockEmailsSend.mockRejectedValueOnce(new Error('Network connection timeout'));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'RESEND_API_KEY') return 're_test_key_12345';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    await service.onModuleInit();

    const result = await service.sendAdminOtpEmail('admin@avelora.com', '112233');

    expect(result.success).toBe(false);
    expect(result.configured).toBe(true);
  });
});
