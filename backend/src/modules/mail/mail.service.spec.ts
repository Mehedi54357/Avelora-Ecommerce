import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';

jest.mock('resend');
jest.mock('nodemailer');

describe('MailService - Multi-Transport & Security Verification', () => {
  let service: MailService;
  let mockEmailsSend: jest.Mock;
  let mockSmtpSendMail: jest.Mock;

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

    mockSmtpSendMail = jest.fn().mockResolvedValue({
      messageId: 'smtp_123456789',
    });

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSmtpSendMail,
    });
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

  it('2. Initializes Nodemailer SMTP transport when SMTP_USER and SMTP_PASS are present', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'SMTP_USER') return 'aveloraelegance@gmail.com';
              if (key === 'SMTP_PASS') return 'app-password-secret';
              if (key === 'SMTP_HOST') return 'smtp.gmail.com';
              if (key === 'SMTP_PORT') return '587';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    await service.onModuleInit();

    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: 'aveloraelegance@gmail.com',
          pass: 'app-password-secret',
        },
      }),
    );
    expect(service.isConfigured()).toBe(true);

    const result = await service.sendAdminOtpEmail('admin@avelora.com', '654321', 'Super Admin');
    expect(result.success).toBe(true);
    expect(mockSmtpSendMail).toHaveBeenCalled();
  });

  it('3. Gracefully provides Dev Mode console fallback when unconfigured in non-production', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'NODE_ENV') return 'development';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    await service.onModuleInit();

    expect(service.isConfigured()).toBe(false);

    const result = await service.sendAdminOtpEmail('admin@avelora.com', '123456');
    expect(result.success).toBe(true);
    expect(result.configured).toBe(false);
    expect(result.message).toContain('Development Mode');
  });

  it('4. Fails securely when unconfigured in production environment', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'NODE_ENV') return 'production';
              return null;
            }),
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

  it('5. Successfully sends Admin Login OTP email with custom MAIL_FROM via Resend', async () => {
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

  it('6. Successfully sends Password Reset OTP email with custom MAIL_FROM via Resend', async () => {
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

  it('7. Fails securely and returns error when Resend API returns an error object', async () => {
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

  it('8. Fails securely when Resend API throws an unexpected network exception', async () => {
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

