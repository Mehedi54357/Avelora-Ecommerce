import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { QrService } from './qr.service';
import { QrTokenService } from './qr-token.service';
import { QrScanEvent } from '../../schemas/qr-scan-event.schema';
import { IdempotencyKey } from '../../schemas/idempotency-key.schema';
import { Product } from '../../schemas/product.schema';
import { Order, OrderStatus } from '../../schemas/order.schema';
import { QrPurpose } from '../../schemas/qr-token.schema';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as QRCode from 'qrcode';

describe('QrService - Rendering, Generation & One-Time Token Security', () => {
  let service: QrService;
  let qrTokenService: QrTokenService;
  let mockScanEventModel: any;
  let mockIdempotencyModel: any;
  let mockProductModel: any;
  let mockOrderModel: any;
  let mockConfigService: any;
  let mockQrTokenService: any;

  beforeEach(async () => {
    mockScanEventModel = {
      create: jest.fn().mockResolvedValue(true),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    };

    mockIdempotencyModel = {
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      create: jest.fn().mockResolvedValue(true),
    };

    mockProductModel = {
      findById: jest.fn(),
      findOne: jest.fn(),
    };

    mockOrderModel = {
      findById: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'FRONTEND_URL') return 'https://avelora.com';
        return null;
      }),
    };

    mockQrTokenService = {
      createToken: jest.fn().mockResolvedValue({
        token: {
          _id: 'tok_123',
          tokenHash: 'hash_abc',
          expiresAt: new Date(Date.now() + 600000),
          isConsumed: false,
        },
        payload: 'AV1:F:tok_123:secret_token_123',
      }),
      verifyRawToken: jest.fn().mockResolvedValue({
        _id: 'tok_123',
        entityId: 'ord_123',
        purpose: QrPurpose.FULFILL_SHIPMENT,
        isConsumed: false,
      }),
      consumeToken: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QrService,
        { provide: QrTokenService, useValue: mockQrTokenService },
        { provide: getModelToken(QrScanEvent.name), useValue: mockScanEventModel },
        { provide: getModelToken(IdempotencyKey.name), useValue: mockIdempotencyModel },
        { provide: getModelToken(Product.name), useValue: mockProductModel },
        { provide: getModelToken(Order.name), useValue: mockOrderModel },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<QrService>(QrService);
    qrTokenService = module.get<QrTokenService>(QrTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('1. QR Data URL Generation & Integrity', () => {
    it('should generate a valid, non-empty PNG data URL with positive size and correct headers', async () => {
      const payload = 'https://avelora.com/q/p/PRD-TEST01';
      const dataUrl = await service.generateQrCodeDataUrl(payload, { width: 300 });

      expect(dataUrl).toBeDefined();
      expect(typeof dataUrl).toBe('string');
      expect(dataUrl.startsWith('data:image/png;base64,')).toBe(true);
      expect(dataUrl.length).toBeGreaterThan(100);

      // Verify that the generated base64 PNG has a non-zero buffer
      const base64Data = dataUrl.replace('data:image/png;base64,', '');
      const buffer = Buffer.from(base64Data, 'base64');
      expect(buffer.length).toBeGreaterThan(0);
      // PNG header magic bytes: 0x89, 0x50, 0x4E, 0x47
      expect(buffer[0]).toBe(0x89);
      expect(buffer[1]).toBe(0x50);
      expect(buffer[2]).toBe(0x4e);
      expect(buffer[3]).toBe(0x47);
    });

    it('should generate valid vector SVG strings for crisp resolution printing', async () => {
      const payload = 'AV1:F:ord_123:abc';
      const svg = await service.generateQrCodeSvg(payload);

      expect(svg).toBeDefined();
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg.includes('</svg>')).toBe(true);
    });
  });

  describe('2. Stable Product QR Resolution', () => {
    it('should create and return permanent product QR URL pointing to canonical domain', async () => {
      const mockProduct = {
        _id: 'prod_999',
        name: 'Royal Velvet Embroidered Panjabi',
        slug: 'royal-velvet-embroidered-panjabi',
        qr: { publicCode: 'PRD-VELVET' },
        save: jest.fn().mockResolvedValue(true),
      };

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProduct),
      });

      const result = await service.getOrCreateProductQr('prod_999');

      expect(result.publicCode).toBe('PRD-VELVET');
      expect(result.resolveUrl).toBe('https://avelora.com/q/p/PRD-VELVET');
      expect(result.qrDataUrl.startsWith('data:image/png;base64,')).toBe(true);
    });

    it('should resolve product from public code for redirection', async () => {
      const mockProduct = {
        _id: 'prod_999',
        name: 'Royal Velvet Embroidered Panjabi',
        slug: 'royal-velvet-embroidered-panjabi',
      };

      mockProductModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockProduct),
        }),
      });

      const result = await service.resolveProductByPublicCode('PRD-VELVET');
      expect(result.id).toBe('prod_999');
      expect(result.slug).toBe('royal-velvet-embroidered-panjabi');
    });
  });

  describe('3. Secure Order Fulfillment QR & Duplicate Scan Protection', () => {
    it('should issue one-time fulfillment QR token and update label version', async () => {
      const mockOrder = {
        _id: 'ord_123',
        orderId: 'AVE-20260826-001',
        qr: { labelVersion: 1 },
        save: jest.fn().mockResolvedValue(true),
      };

      mockOrderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrder),
      });

      const result = await service.issueOrderFulfillmentQr('ord_123', 'admin_1');

      expect(result.payload).toContain('AV1:F:');
      expect(result.qrDataUrl.startsWith('data:image/png;base64,')).toBe(true);
      expect(mockOrder.qr.labelVersion).toBe(2);
    });

    it('should prevent duplicate QR fulfillment and throw ConflictException if token is already consumed', async () => {
      const payload = 'AV1:F:tok_123:secret_token_123';
      const mockOrder = {
        _id: 'ord_123',
        orderId: 'AVE-20260826-001',
        status: OrderStatus.PROCESSING,
      };
      mockOrderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrder),
      });

      mockQrTokenService.consumeToken.mockRejectedValue(
        new ConflictException('QR token has already been consumed or processed'),
      );

      await expect(
        service.fulfillOrderQr(
          payload,
          'MARK_SHIPPED',
          'admin_1',
          'STAFF',
          'idemp_unique_1',
          jest.fn(),
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('4. Privacy-Aware Order QR Resolution & Printing Details', () => {
    const sampleOrder = {
      _id: 'ord_999',
      orderId: 'AVE-20261008-00123',
      status: OrderStatus.CONFIRMED,
      fulfillmentStatus: 'PROCESSING',
      fulfillmentMethod: 'COURIER',
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      subtotal: 4500,
      discount: 200,
      deliveryCharge: 80,
      totalAmount: 4380,
      paidAmount: 0,
      dueAmount: 4380,
      customerDetails: {
        name: 'Mehedi Hasan',
        mobile: '01712345678',
        address: 'House 12, Road 5, Banani',
        district: 'Dhaka',
        division: 'Dhaka',
      },
      items: [
        {
          productId: 'prod_1',
          productName: 'Royal Panjabi',
          sku: 'RPJ-01',
          variant: 'Black / L',
          quantity: 1,
          unitPrice: 4500,
        },
      ],
      notes: 'Please call before delivery',
    };

    it('should resolve order anonymously and mask sensitive customer data', async () => {
      mockOrderModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(sampleOrder),
      });

      const result = await service.resolveOrderQrDetails('AVE-20261008-00123');

      expect(result.success).toBe(true);
      expect(result.isAuthorized).toBe(false);
      expect(result.authorizationType).toBe('ANONYMOUS');
      expect(result.order.customer.mobile).toContain('****');
      expect(result.order.customer.name).toContain('*');
      expect(result.order.financials.totalAmount).toBe(4380);
      expect(result.order.items.length).toBe(1);
      expect(result.order.qrCodeDataUrl).toBeDefined();
    });

    it('should unlock complete customer details when recipient mobile number is provided', async () => {
      mockOrderModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(sampleOrder),
      });

      const result = await service.resolveOrderQrDetails('AVE-20261008-00123', '01712345678');

      expect(result.success).toBe(true);
      expect(result.isAuthorized).toBe(true);
      expect(result.authorizationType).toBe('CUSTOMER');
      expect(result.order.customer.name).toBe('Mehedi Hasan');
      expect(result.order.customer.mobile).toBe('01712345678');
      expect(result.order.customer.address).toBe('House 12, Road 5, Banani');
      expect(result.order.customer.notes).toBe('Please call before delivery');
    });
  });
});

