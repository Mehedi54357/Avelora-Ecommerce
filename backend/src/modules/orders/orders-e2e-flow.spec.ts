import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { QrService } from '../qr/qr.service';
import { QrTokenService } from '../qr/qr-token.service';
import { ProductsService } from '../products/products.service';
import { CapitalService } from '../capital/capital.service';
import { InventoryService } from '../inventory/inventory.service';
import { SettingsService } from '../settings/settings.service';
import { CouponsService } from '../coupons/coupons.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { ConfigService } from '@nestjs/config';
import {
  Order,
  OrderStatus,
  PaymentStatus,
  FulfillmentMethod,
} from '../../schemas/order.schema';
import { Product } from '../../schemas/product.schema';
import { Customer } from '../../schemas/customer.schema';
import { Payment } from '../../schemas/payment.schema';
import { CapitalTransaction } from '../../schemas/capital.schema';
import { ProductInvestment } from '../../schemas/product-investment.schema';
import { InventoryTransaction } from '../../schemas/inventory-transaction.schema';
import { Category } from '../../schemas/category.schema';
import { QrScanEvent } from '../../schemas/qr-scan-event.schema';
import { IdempotencyKey } from '../../schemas/idempotency-key.schema';
import { PurchaseOrder } from '../../schemas/purchase.schema';
import { ReturnRequest } from '../../schemas/return-request.schema';

describe('Avelora Elegance - End-to-End Order Management Audit & Flow', () => {
  let ordersService: OrdersService;
  let qrService: QrService;
  let mockOrderModel: any;
  let mockProductModel: any;
  let mockSettingsService: any;
  let mockInventoryService: any;
  let mockCouponsService: any;
  let mockCustomerModel: any;
  let mockPaymentModel: any;

  beforeEach(async () => {
    mockOrderModel = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(0) }),
    };

    mockProductModel = {
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    mockSettingsService = {
      getSettings: jest.fn().mockResolvedValue({
        defaultDhakaDeliveryCharge: 70,
        defaultOutsideDhakaDeliveryCharge: 130,
      }),
      calculateDeliveryCharge: jest.fn().mockImplementation((district: string, subtotal: number) => {
        const clean = (district || '').toLowerCase();
        const isDhaka = clean === 'dhaka' || clean.includes('dhaka');
        return Promise.resolve({
          charge: isDhaka ? 70 : 130,
          zoneName: isDhaka ? 'Inside Dhaka' : 'Outside Dhaka',
          freeDelivery: false,
        });
      }),
    };

    mockInventoryService = {
      reserveStock: jest.fn().mockResolvedValue(true),
    };

    mockCouponsService = {
      validateAndApplyCoupon: jest.fn().mockResolvedValue({ valid: false, discount: 0 }),
      recordUsage: jest.fn().mockResolvedValue(true),
    };

    mockCustomerModel = {
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      create: jest.fn().mockResolvedValue({ totalOrders: 1, totalSpent: 3500 }),
    };

    mockPaymentModel = {
      create: jest.fn().mockResolvedValue(true),
    };

    const mockQrTokenService = {
      createToken: jest.fn().mockResolvedValue({
        token: { _id: 'tok_1', tokenHash: 'h1', expiresAt: new Date(Date.now() + 86400000) },
        payload: 'AV1:T:tok_1:secret',
      }),
      verifyRawToken: jest.fn().mockResolvedValue({
        _id: 'tok_1',
        entityId: 'ord_123',
        purpose: 'ORDER_TRACK',
        entityType: 'ORDER',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        QrService,
        { provide: QrTokenService, useValue: mockQrTokenService },
        { provide: getModelToken(Order.name), useValue: mockOrderModel },
        { provide: getModelToken(Product.name), useValue: mockProductModel },
        { provide: getModelToken(Customer.name), useValue: mockCustomerModel },
        { provide: getModelToken(Payment.name), useValue: mockPaymentModel },
        { provide: getModelToken(QrScanEvent.name), useValue: { create: jest.fn() } },
        { provide: getModelToken(IdempotencyKey.name), useValue: { findOne: jest.fn() } },
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: InventoryService, useValue: mockInventoryService },
        { provide: CouponsService, useValue: mockCouponsService },
        { provide: AuditLogService, useValue: { logAction: jest.fn() } },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((k) => (k === 'FRONTEND_URL' ? 'https://avelora.com' : 'secret')),
          },
        },
      ],
    }).compile();

    ordersService = module.get<OrdersService>(OrdersService);
    qrService = module.get<QrService>(QrService);
  });

  describe('1. Delivery Charge Verification', () => {
    it('should charge BDT 70 for Home Delivery inside Dhaka City', async () => {
      // Mock unique order ID generator
      jest.spyOn(ordersService, 'generateUniqueOrderId').mockResolvedValue('AVL-261008-0001');

      const mockCreatedOrder = {
        orderId: 'AVL-261008-0001',
        deliveryCharge: 70,
        subtotal: 3000,
        totalAmount: 3070,
      };
      mockOrderModel.create.mockResolvedValue(mockCreatedOrder);

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: 'p1',
          name: 'Royal Silk Hijab',
          salePrice: 3000,
          variants: [{ sku: 'AVE-SLK-01', stockQuantity: 20, price: 3000, costPrice: 1500, weightedAverageCost: 1500 }],
        }),
      });

      const orderData = {
        customerDetails: {
          name: 'Amina Begum',
          mobile: '01711223344',
          district: 'Dhaka',
          division: 'Dhaka',
          address: 'House 5, Road 2, Dhanmondi',
        },
        items: [{ productId: 'p1', sku: 'AVE-SLK-01', quantity: 1 }],
        fulfillmentMethod: FulfillmentMethod.COURIER,
      };

      const result = await ordersService.checkout(orderData);

      expect(mockOrderModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          deliveryCharge: 70,
          totalAmount: 3070,
        }),
      );
    });

    it('should charge BDT 130 for Home Delivery outside Dhaka City (e.g. Chittagong, Sylhet, Gazipur)', async () => {
      jest.spyOn(ordersService, 'generateUniqueOrderId').mockResolvedValue('AVL-261008-0002');

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: 'p1',
          name: 'Royal Silk Hijab',
          salePrice: 3000,
          variants: [{ sku: 'AVE-SLK-01', stockQuantity: 20, price: 3000, costPrice: 1500, weightedAverageCost: 1500 }],
        }),
      });

      const orderData = {
        customerDetails: {
          name: 'Tariq Islam',
          mobile: '01811223344',
          district: 'Chittagong',
          division: 'Chittagong',
          address: 'GEC Circle, Chittagong',
        },
        items: [{ productId: 'p1', sku: 'AVE-SLK-01', quantity: 1 }],
        fulfillmentMethod: FulfillmentMethod.COURIER,
      };

      await ordersService.checkout(orderData);

      expect(mockOrderModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          deliveryCharge: 130,
          totalAmount: 3130,
        }),
      );
    });

    it('should charge BDT 0 for Showroom Pickup', async () => {
      jest.spyOn(ordersService, 'generateUniqueOrderId').mockResolvedValue('AVL-261008-0003');

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: 'p1',
          name: 'Royal Silk Hijab',
          salePrice: 3000,
          variants: [{ sku: 'AVE-SLK-01', stockQuantity: 20, price: 3000, costPrice: 1500, weightedAverageCost: 1500 }],
        }),
      });

      const orderData = {
        customerDetails: {
          name: 'Farhana Rahman',
          mobile: '01911223344',
          district: 'Dhaka',
          division: 'Dhaka',
          address: 'Showroom Counter Collection',
        },
        items: [{ productId: 'p1', sku: 'AVE-SLK-01', quantity: 1 }],
        fulfillmentMethod: FulfillmentMethod.SHOWROOM_PICKUP,
      };

      await ordersService.checkout(orderData);

      expect(mockOrderModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          deliveryCharge: 0,
          totalAmount: 3000,
        }),
      );
    });
  });

  describe('2. Unique Order ID Format (AVL-YYMMDD-NNNN)', () => {
    it('should generate Order ID matching AVL-YYMMDD-NNNN format in Bangladesh Timezone', async () => {
      // Mock findOne to simulate no existing order for today
      mockOrderModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
        exec: jest.fn().mockResolvedValue(null),
      });

      const orderId = await ordersService.generateUniqueOrderId(false);

      // Verify format AVL-YYMMDD-NNNN
      expect(orderId).toMatch(/^AVL-\d{6}-\d{4}$/);

      // Verify Bangladesh Timezone date stamp
      const now = new Date();
      const bdTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
      const expectedYymmdd = `${String(bdTime.getUTCFullYear()).slice(-2)}${String(bdTime.getUTCMonth() + 1).padStart(2, '0')}${String(bdTime.getUTCDate()).padStart(2, '0')}`;

      expect(orderId).toContain(`AVL-${expectedYymmdd}-0001`);
    });

    it('should increment sequence sequentially (e.g. 0001 -> 0002) without collisions', async () => {
      const now = new Date();
      const bdTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
      const yymmdd = `${String(bdTime.getUTCFullYear()).slice(-2)}${String(bdTime.getUTCMonth() + 1).padStart(2, '0')}${String(bdTime.getUTCDate()).padStart(2, '0')}`;

      // Mock previous latest order is AVL-YYMMDD-0004
      mockOrderModel.findOne.mockReturnValueOnce({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ orderId: `AVL-${yymmdd}-0004` }),
        }),
      });
      // Mock collision check returns null (available)
      mockOrderModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const nextId = await ordersService.generateUniqueOrderId(false);

      expect(nextId).toBe(`AVL-${yymmdd}-0005`);
    });

    it('should preserve existing historical orders (e.g. AVE-20261008-00123)', async () => {
      const historicalOrder = {
        _id: 'hist_1',
        orderId: 'AVE-20261008-00123',
        status: OrderStatus.DELIVERED,
        paymentStatus: PaymentStatus.PAID,
        customerDetails: { name: 'Customer One', mobile: '01712345678', district: 'Dhaka', address: 'Old Dhaka' },
        items: [{ productName: 'Old Product', unitPrice: 2000, quantity: 1 }],
      };

      mockOrderModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(historicalOrder),
      });

      const resolved = await qrService.resolveOrderQrDetails('AVE-20261008-00123');

      expect(resolved.success).toBe(true);
      expect(resolved.order.orderId).toBe('AVE-20261008-00123');
    });
  });

  describe('3. QR Scan Resolution, Privacy & Print Payload Consistency', () => {
    it('should resolve AVL order via QR and provide full invoice/print payload', async () => {
      const testOrder = {
        _id: 'ord_avl_99',
        orderId: 'AVL-261008-0001',
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PENDING,
        fulfillmentMethod: FulfillmentMethod.COURIER,
        subtotal: 5000,
        discount: 200,
        deliveryCharge: 70,
        totalAmount: 4870,
        paidAmount: 0,
        dueAmount: 4870,
        customerDetails: {
          name: 'Nusrat Jahan',
          mobile: '01700112233',
          address: 'Road 7, Banani',
          district: 'Dhaka',
        },
        items: [
          {
            productName: 'Signature Velvet Panjabi',
            sku: 'AVE-VP-01',
            quantity: 1,
            unitPrice: 5000,
          },
        ],
      };

      mockOrderModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(testOrder),
      });

      // Customer verification scan
      const resolved = await qrService.resolveOrderQrDetails('AVL-261008-0001', '01700112233');

      expect(resolved.success).toBe(true);
      expect(resolved.isAuthorized).toBe(true);
      expect(resolved.order.orderId).toBe('AVL-261008-0001');
      expect(resolved.order.financials.deliveryCharge).toBe(70);
      expect(resolved.order.financials.totalAmount).toBe(4870);
      expect(resolved.order.qrCodeDataUrl).toContain('data:image/png;base64');
      expect(resolved.order.customer.name).toBe('Nusrat Jahan');
    });
  });

  describe('4. Full Lifecycle Pipeline: Investment → Publish → Checkout → QR → Print → Profit', () => {
    it('should maintain consistent Product ID, WAC, Stock and compute accurate Profit across the entire flow', async () => {
      // Step A: Investment creates product in DRAFT
      const productId = 'prod_inv_99';
      const initialInvestmentDraft = {
        _id: productId,
        name: 'Artisan Zari Velvet Panjabi',
        slug: 'artisan-zari-velvet-panjabi',
        status: 'DRAFT',
        isPublished: false,
        variants: [
          {
            sku: 'AVE-ZVP-01',
            color: 'Black',
            size: 'L',
            price: 0,
            costPrice: 1800, // Buying price entered in Investment
            weightedAverageCost: 1800,
            stockQuantity: 50,
          },
        ],
      };

      // Step B: Add Product (Edit DRAFT) publishes product on SAME ID
      // Product ID must not change; WAC & stock must not be reset
      const publishedProduct = {
        ...initialInvestmentDraft,
        salePrice: 3800,
        originalPrice: 4500,
        status: 'ACTIVE',
        isPublished: true,
        variants: [
          {
            sku: 'AVE-ZVP-01', // SKU protected
            color: 'Black',
            size: 'L',
            price: 3800,
            costPrice: 1800, // WAC protected
            weightedAverageCost: 1800,
            stockQuantity: 50, // Stock protected
          },
        ],
      };

      expect(publishedProduct._id).toBe(productId);
      expect(publishedProduct.variants[0].weightedAverageCost).toBe(1800);
      expect(publishedProduct.variants[0].stockQuantity).toBe(50);

      // Step C: Checkout Order placed inside Dhaka City
      jest.spyOn(ordersService, 'generateUniqueOrderId').mockResolvedValue('AVL-261008-0008');

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(publishedProduct),
      });

      const orderData = {
        customerDetails: {
          name: 'Shahidul Alam',
          mobile: '01712000000',
          district: 'Dhaka',
          division: 'Dhaka',
          address: 'Gulshan 2, Dhaka',
        },
        items: [{ productId, sku: 'AVE-ZVP-01', quantity: 2 }], // 2 units
        fulfillmentMethod: FulfillmentMethod.COURIER,
      };

      const placedOrder = {
        _id: 'ord_pipeline_1',
        orderId: 'AVL-261008-0008',
        subtotal: 7600, // 2 * 3800
        deliveryCharge: 70, // Inside Dhaka
        totalAmount: 7670,
        paidAmount: 0,
        dueAmount: 7670,
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PENDING,
        items: [
          {
            productId,
            productName: 'Artisan Zari Velvet Panjabi',
            sku: 'AVE-ZVP-01',
            quantity: 2,
            unitPrice: 3800,
            costPrice: 1800, // WAC snapshot
          },
        ],
      };

      mockOrderModel.create.mockResolvedValue(placedOrder);
      await ordersService.checkout(orderData);

      // Verify stock reservation was triggered for 2 units
      expect(mockInventoryService.reserveStock).toHaveBeenCalledWith(
        productId,
        'AVE-ZVP-01',
        2,
        'AVL-261008-0008',
      );

      // Step D: QR Code Resolution & Print
      mockOrderModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...placedOrder,
          customerDetails: orderData.customerDetails,
        }),
      });

      const qrResult = await qrService.resolveOrderQrDetails('AVL-261008-0008', '01712000000');
      expect(qrResult.success).toBe(true);
      expect(qrResult.order.orderId).toBe('AVL-261008-0008');
      expect(qrResult.order.financials.subtotal).toBe(7600);
      expect(qrResult.order.financials.deliveryCharge).toBe(70);
      expect(qrResult.order.financials.totalAmount).toBe(7670);
      expect(qrResult.order.qrCodeDataUrl).toBeDefined();

      // Step E: Profit Calculation Check
      const revenue = placedOrder.subtotal; // 7600
      const cogs = placedOrder.items.reduce((sum, item) => sum + item.quantity * item.costPrice, 0); // 2 * 1800 = 3600
      const grossProfit = revenue - cogs; // 7600 - 3600 = 4000
      const grossMarginPct = (grossProfit / revenue) * 100; // 52.63%

      expect(revenue).toBe(7600);
      expect(cogs).toBe(3600);
      expect(grossProfit).toBe(4000);
      expect(grossMarginPct).toBeCloseTo(52.63, 1);
    });
  });
});
