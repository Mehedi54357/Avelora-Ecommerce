import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { PathaoService } from './pathao.service';
import { PathaoToken } from '../../schemas/pathao-token.schema';
import { Order, OrderStatus, PaymentStatus, CourierSettlementStatus } from '../../schemas/order.schema';
import { AuditLogService } from '../audit-log/audit-log.service';
import { BadRequestException } from '@nestjs/common';

import { Settings } from '../../schemas/settings.schema';

describe('PathaoService - Real Courier Merchant API & Lifecycle Accounting', () => {
  let service: PathaoService;
  let mockTokenModel: any;
  let mockOrderModel: any;
  let mockSettingsModel: any;
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

    mockSettingsModel = {
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
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
        { provide: getModelToken(Settings.name), useValue: mockSettingsModel },
        { provide: AuditLogService, useValue: mockAuditLogService },
      ],
    }).compile();

    service = module.get<PathaoService>(PathaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('1. should prevent duplicate courier bookings on already booked orders', async () => {
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

  it('2. should reuse valid non-expired access tokens without issuing redundant tokens', async () => {
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

  it('3. should transition order to COURIER_BOOKED (NOT SHIPPED) upon successful Pathao booking', async () => {
    const validFuture = new Date(Date.now() + 3600 * 1000);
    mockTokenModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        accessToken: 'valid_bearer_token_abc',
        expiresAt: validFuture,
      }),
    });

    const mockOrder: any = {
      _id: 'ord_123',
      orderId: 'AVE-20260826-001',
      status: OrderStatus.PROCESSING,
      paymentMethod: 'COD',
      dueAmount: 3500,
      subtotal: 3500,
      deliveryCharge: 80,
      items: [{ productName: 'Velvet Dress', sku: 'VD-01', quantity: 1 }],
      timeline: [],
      courier: {},
      save: jest.fn().mockResolvedValue(true),
    };

    mockOrderModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockOrder) });

    // Mock Pathao API fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        type: 'success',
        data: {
          consignment_id: 'PATHAO-992211',
          delivery_fee: 80,
          order_status: 'Pending',
        },
      }),
    } as any);

    const result = await service.createOrder('ord_123', {
      storeId: 1,
      recipientCity: 1,
      recipientZone: 1,
    });

    expect(result.success).toBe(true);
    expect(result.consignmentId).toBe('PATHAO-992211');
    expect(mockOrder.status).toBe(OrderStatus.COURIER_BOOKED);
    expect(mockOrder.courier?.settlementStatus).toBe(CourierSettlementStatus.AWAITING_SETTLEMENT);
    expect(mockOrder.courier?.expectedSettlement).toBe(3420); // 3500 - 80
  });

  it('4. should transition order to SHIPPED when Pathao status confirms in-transit/pickup', async () => {
    const validFuture = new Date(Date.now() + 3600 * 1000);
    mockTokenModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        accessToken: 'valid_bearer_token_abc',
        expiresAt: validFuture,
      }),
    });

    const mockOrder = {
      _id: 'ord_123',
      orderId: 'AVE-20260826-001',
      status: OrderStatus.COURIER_BOOKED,
      courier: {
        provider: 'Pathao',
        consignmentId: 'PATHAO-992211',
      },
      timeline: [],
      save: jest.fn().mockResolvedValue(true),
    };

    mockOrderModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockOrder) });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: {
          consignment_id: 'PATHAO-992211',
          order_status: 'In_Transit',
        },
      }),
    } as any);

    const result = await service.syncConsignmentStatus('ord_123');

    expect(result.orderStatus).toBe(OrderStatus.SHIPPED);
    expect(mockOrder.status).toBe(OrderStatus.SHIPPED);
  });

  it('5. should transition order to DELIVERED with AWAITING_SETTLEMENT on delivery without prematurely increasing bank cash', async () => {
    const validFuture = new Date(Date.now() + 3600 * 1000);
    mockTokenModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        accessToken: 'valid_bearer_token_abc',
        expiresAt: validFuture,
      }),
    });

    const mockOrder = {
      _id: 'ord_123',
      orderId: 'AVE-20260826-001',
      status: OrderStatus.SHIPPED,
      paymentMethod: 'COD',
      paymentStatus: PaymentStatus.PENDING,
      courier: {
        provider: 'Pathao',
        consignmentId: 'PATHAO-992211',
        settlementStatus: CourierSettlementStatus.AWAITING_SETTLEMENT,
      },
      timeline: [],
      save: jest.fn().mockResolvedValue(true),
    };

    mockOrderModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockOrder) });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: {
          consignment_id: 'PATHAO-992211',
          order_status: 'Delivered',
        },
      }),
    } as any);

    const result = await service.syncConsignmentStatus('ord_123');

    expect(result.orderStatus).toBe(OrderStatus.DELIVERED);
    expect(mockOrder.status).toBe(OrderStatus.DELIVERED);
    expect(mockOrder.paymentStatus).toBe(PaymentStatus.PAID);
    expect(mockOrder.courier.settlementStatus).toBe(CourierSettlementStatus.AWAITING_SETTLEMENT);
  });

  it('6. should transition order to RETURNED on RTO with zero revenue recognition', async () => {
    const validFuture = new Date(Date.now() + 3600 * 1000);
    mockTokenModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        accessToken: 'valid_bearer_token_abc',
        expiresAt: validFuture,
      }),
    });

    const mockOrder = {
      _id: 'ord_123',
      orderId: 'AVE-20260826-001',
      status: OrderStatus.SHIPPED,
      paymentMethod: 'COD',
      courier: {
        provider: 'Pathao',
        consignmentId: 'PATHAO-992211',
        settlementStatus: CourierSettlementStatus.AWAITING_SETTLEMENT,
      },
      timeline: [],
      save: jest.fn().mockResolvedValue(true),
    };

    mockOrderModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockOrder) });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: {
          consignment_id: 'PATHAO-992211',
          order_status: 'Returned',
        },
      }),
    } as any);

    const result = await service.syncConsignmentStatus('ord_123');

    expect(result.orderStatus).toBe(OrderStatus.RETURNED);
    expect(mockOrder.status).toBe(OrderStatus.RETURNED);
    expect(mockOrder.courier.settlementStatus).toBe(CourierSettlementStatus.NOT_APPLICABLE);
  });
});
