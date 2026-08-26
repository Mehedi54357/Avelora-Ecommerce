import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { PathaoService } from './pathao.service';
import { PathaoToken } from '../../schemas/pathao-token.schema';
import { Order, OrderStatus } from '../../schemas/order.schema';
import { AuditLogService } from '../audit-log/audit-log.service';
import { BadRequestException } from '@nestjs/common';

describe('PathaoService - Real Courier Merchant API', () => {
  let service: PathaoService;
  let mockTokenModel: any;
  let mockOrderModel: any;
  let mockConfigService: any;
  let mockAuditLogService: any;

  beforeEach(async () => {
    mockTokenModel = {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };

    mockOrderModel = {
      findById: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'PATHAO_SANDBOX') return 'true';
        if (key === 'PATHAO_CLIENT_ID') return 'mock_client_id';
        if (key === 'PATHAO_CLIENT_SECRET') return 'mock_client_secret';
        if (key === 'PATHAO_USERNAME') return 'merchant@avelora.com';
        if (key === 'PATHAO_PASSWORD') return 'mock_password';
        return null;
      }),
    };

    mockAuditLogService = {
      logAction: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PathaoService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getModelToken(PathaoToken.name), useValue: mockTokenModel },
        { provide: getModelToken(Order.name), useValue: mockOrderModel },
        { provide: AuditLogService, useValue: mockAuditLogService },
      ],
    }).compile();

    service = module.get<PathaoService>(PathaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should prevent duplicate courier bookings on already dispatched orders', async () => {
    const existingOrder = {
      _id: 'ord_123',
      orderId: 'AVE-20260826-001',
      courier: {
        provider: 'Pathao',
        consignmentId: 'PATHAO-998811',
      },
    };

    mockOrderModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingOrder) });

    await expect(
      service.createOrder('ord_123', {
        storeId: 1,
        recipientCity: 1,
        recipientZone: 1,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reuse valid non-expired access tokens without issuing redundant tokens', async () => {
    const validFuture = new Date(Date.now() + 3600 * 1000);
    mockTokenModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        accessToken: 'valid_bearer_token_abc',
        expiresAt: validFuture,
      }),
    });

    const token = await service.getValidAccessToken();
    expect(token).toBe('valid_bearer_token_abc');
  });
});
