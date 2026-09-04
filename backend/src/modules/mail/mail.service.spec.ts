import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('MailService - SMTP Configuration & Verification', () => {
  let service: MailService;
  let mockTransporter: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTransporter = {
      verify: jest.fn().mockResolvedValue(true),
      sendMail: jest.fn().mockResolvedValue({ messageId: 'msg_123' }),
    };
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
  });

  it('1. Initializes and verifies transporter when SMTP env variables are present', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'SMTP_HOST') return 'smtp.gmail.com';
              if (key === 'SMTP_PORT') return '465';
              if (key === 'SMTP_SECURE') return 'true';
              if (key === 'SMTP_USER') return 'aveloraelegance@gmail.com';
              if (key === 'SMTP_PASS') return 'mockapppass1234';
              if (key === 'MAIL_FROM') return 'AVELORA Security <aveloraelegance@gmail.com>';
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
        port: 465,
        secure: true,
        auth: {
          user: 'aveloraelegance@gmail.com',
          pass: 'mockapppass1234',
        },
      }),
    );
    expect(mockTransporter.verify).toHaveBeenCalledTimes(1);
    expect(service.isConfigured()).toBe(true);
  });

  it('2. Gracefully handles missing SMTP credentials without throwing', async () => {
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

    expect(nodemailer.createTransport).not.toHaveBeenCalled();
    expect(service.isConfigured()).toBe(false);

    const result = await service.sendAdminOtpEmail('admin@avelora.com', '123456');
    expect(result.success).toBe(false);
    expect(result.configured).toBe(false);
  });

  it('3. Fails securely when SMTP verification rejects (e.g. invalid app password)', async () => {
    mockTransporter.verify.mockRejectedValue(new Error('Invalid login: 535-5.7.8 Username and Password not accepted'));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'SMTP_HOST') return 'smtp.gmail.com';
              if (key === 'SMTP_PORT') return '465';
              if (key === 'SMTP_SECURE') return 'true';
              if (key === 'SMTP_USER') return 'aveloraelegance@gmail.com';
              if (key === 'SMTP_PASS') return 'wrongpass';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    await service.onModuleInit();

    expect(service.isConfigured()).toBe(false);
  });

  it('4. sendAdminOtpEmail dispatches structured HTML email', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'SMTP_USER') return 'aveloraelegance@gmail.com';
              if (key === 'SMTP_PASS') return 'mockapppass1234';
              if (key === 'MAIL_FROM') return 'AVELORA Security <aveloraelegance@gmail.com>';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    await service.onModuleInit();

    const result = await service.sendAdminOtpEmail('recipient@example.com', '987654', 'Admin');
    expect(result.success).toBe(true);
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'recipient@example.com',
        subject: 'AVELORA Admin Verification Code',
        from: 'AVELORA Security <aveloraelegance@gmail.com>',
      }),
    );
    // Verify OTP code is in the HTML payload
    const mailArgs = mockTransporter.sendMail.mock.calls[0][0];
    expect(mailArgs.html).toContain('987654');
  });

  it('5. sendPasswordResetEmail dispatches password reset code', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'SMTP_USER') return 'aveloraelegance@gmail.com';
              if (key === 'SMTP_PASS') return 'mockapppass1234';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    await service.onModuleInit();

    const result = await service.sendPasswordResetEmail('reset@example.com', '654321', 'Admin User');
    expect(result.success).toBe(true);
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'reset@example.com',
        subject: 'AVELORA Password Reset Code',
      }),
    );
    const mailArgs = mockTransporter.sendMail.mock.calls[0][0];
    expect(mailArgs.html).toContain('654321');
  });
});
