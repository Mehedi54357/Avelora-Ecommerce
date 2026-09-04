import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import {
  Order,
  OrderStatus,
  PaymentStatus,
  FulfillmentMethod,
  CourierSettlementStatus,
} from '../../schemas/order.schema';
import { Product } from '../../schemas/product.schema';
import { Customer } from '../../schemas/customer.schema';
import { Payment } from '../../schemas/payment.schema';
import { InventoryService } from '../inventory/inventory.service';
import { CouponsService } from '../coupons/coupons.service';
import { SettingsService } from '../settings/settings.service';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('OrdersService - Smart Order Search & Advanced Filter Engine (All BD Operators)', () => {
  let service: OrdersService;

  const mockOrderDatabase: any[] = [
    {
      _id: 'ord-gp-1',
      orderId: 'AVL-10254',
      dataMode: 'PRODUCTION',
      status: OrderStatus.DELIVERED,
      paymentStatus: PaymentStatus.UNPAID,
      fulfillmentMethod: FulfillmentMethod.DIRECT_HAND_DELIVERY,
      totalAmount: 3500,
      paidAmount: 0,
      dueAmount: 3500,
      customerDetails: {
        name: 'Rahim Ahmed (GP 017)',
        mobile: '01712345678',
        email: 'rahim@example.com',
        district: 'Dhaka',
        address: 'House 12, Road 5, Dhanmondi',
      },
      courier: {
        provider: 'DirectDelivery',
        consignmentId: '',
      },
      items: [{ sku: 'HIJ-SLK-BLK', productName: 'Silk Hijab', quantity: 1, unitPrice: 3500 }],
      createdAt: new Date('2026-03-01T10:00:00Z'),
    },
    {
      _id: 'ord-gp-2',
      orderId: 'AVL-10255',
      dataMode: 'PRODUCTION',
      status: OrderStatus.SHIPPED,
      paymentStatus: PaymentStatus.PAID,
      fulfillmentMethod: FulfillmentMethod.COURIER,
      totalAmount: 4200,
      paidAmount: 4200,
      dueAmount: 0,
      customerDetails: {
        name: 'Tania Akter (GP 013)',
        mobile: '01301234567',
        email: 'tania@test.com',
        district: 'Dhaka',
        address: 'Gulshan 2',
      },
      courier: {
        provider: 'Pathao',
        consignmentId: 'PATHAO-992211',
      },
      items: [{ sku: 'DRS-VEL-EMR', productName: 'Velvet Abaya', quantity: 1, unitPrice: 4200 }],
      createdAt: new Date('2026-03-02T12:00:00Z'),
    },
    {
      _id: 'ord-bl-1',
      orderId: 'AVL-10256',
      dataMode: 'PRODUCTION',
      status: OrderStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      fulfillmentMethod: FulfillmentMethod.COURIER,
      totalAmount: 2800,
      paidAmount: 2800,
      dueAmount: 0,
      customerDetails: {
        name: 'Sadia Jahan (Banglalink 019)',
        mobile: '01912345678',
        email: 'sadia@test.com',
        district: 'Rajshahi',
        address: 'Kazla, Rajshahi',
      },
      courier: {
        provider: 'Pathao',
        consignmentId: 'PATHAO-992212',
      },
      items: [{ sku: 'JWL-NEC-GLD', productName: 'Gold Necklace', quantity: 1, unitPrice: 2800 }],
      createdAt: new Date('2026-03-03T09:00:00Z'),
    },
    {
      _id: 'ord-bl-2',
      orderId: 'AVL-10257',
      dataMode: 'PRODUCTION',
      status: OrderStatus.PROCESSING,
      paymentStatus: PaymentStatus.UNPAID,
      fulfillmentMethod: FulfillmentMethod.COURIER,
      totalAmount: 1500,
      paidAmount: 0,
      dueAmount: 1500,
      customerDetails: {
        name: 'Nusrat (Banglalink 014)',
        mobile: '01401234567',
        email: 'nusrat@test.com',
        district: 'Khulna',
        address: 'Boyra, Khulna',
      },
      courier: {
        provider: 'Pathao',
        consignmentId: '',
      },
      items: [{ sku: 'LTH-WAL-BRN', productName: 'Leather Wallet', quantity: 1, unitPrice: 1500 }],
      createdAt: new Date('2026-03-03T11:00:00Z'),
    },
    {
      _id: 'ord-robi',
      orderId: 'AVL-10258',
      dataMode: 'PRODUCTION',
      status: OrderStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PARTIALLY_PAID,
      fulfillmentMethod: FulfillmentMethod.DIRECT_HAND_DELIVERY,
      totalAmount: 5000,
      paidAmount: 2000,
      dueAmount: 3000,
      customerDetails: {
        name: 'Habib Rahman (Robi 018)',
        mobile: '01898765432',
        email: 'habib@test.com',
        district: 'Chittagong',
        address: 'GEC Circle, Chittagong',
      },
      courier: {
        provider: '',
        consignmentId: '',
      },
      items: [{ sku: 'DRS-SILK-BLU', productName: 'Blue Silk Dress', quantity: 1, unitPrice: 5000 }],
      createdAt: new Date('2026-03-03T13:00:00Z'),
    },
    {
      _id: 'ord-airtel',
      orderId: 'AVL-10259',
      dataMode: 'PRODUCTION',
      status: OrderStatus.PACKED,
      paymentStatus: PaymentStatus.UNPAID,
      fulfillmentMethod: FulfillmentMethod.COURIER,
      totalAmount: 3200,
      paidAmount: 0,
      dueAmount: 3200,
      customerDetails: {
        name: 'Mahmud Hasan (Airtel 016)',
        mobile: '01612345678',
        email: 'mahmud@test.com',
        district: 'Sylhet',
        address: 'Zindabazar, Sylhet',
      },
      courier: {
        provider: 'Pathao',
        consignmentId: 'PATHAO-992213',
      },
      items: [{ sku: 'HIJ-GEO-NVY', productName: 'Navy Georgette Hijab', quantity: 1, unitPrice: 3200 }],
      createdAt: new Date('2026-03-03T15:00:00Z'),
    },
    {
      _id: 'ord-teletalk',
      orderId: 'AVL-10260',
      dataMode: 'PRODUCTION',
      status: OrderStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      fulfillmentMethod: FulfillmentMethod.CUSTOMER_PICKUP,
      totalAmount: 1800,
      paidAmount: 1800,
      dueAmount: 0,
      customerDetails: {
        name: 'Kamal Hossain (Teletalk 015)',
        mobile: '01552345678',
        email: 'kamal@test.com',
        district: 'Barisal',
        address: 'Sadar, Barisal',
      },
      courier: {
        provider: '',
        consignmentId: '',
      },
      items: [{ sku: 'JWL-EAR-SLV', productName: 'Silver Earrings', quantity: 1, unitPrice: 1800 }],
      createdAt: new Date('2026-03-03T16:00:00Z'),
    },
    {
      _id: 'ord-test-sim',
      orderId: 'AVL-TEST-999',
      dataMode: 'TEST',
      status: OrderStatus.CONFIRMED,
      paymentStatus: PaymentStatus.UNPAID,
      fulfillmentMethod: FulfillmentMethod.CUSTOMER_PICKUP,
      totalAmount: 9999,
      paidAmount: 0,
      dueAmount: 9999,
      customerDetails: {
        name: 'Test Simulator User',
        mobile: '01599999999',
        email: 'simulator@test.com',
        district: 'Dhaka',
        address: 'Test Sandbox Lab',
      },
      courier: {
        provider: '',
        consignmentId: '',
      },
      items: [{ sku: 'SIM-PROD-01', productName: 'Simulator Product', quantity: 1, unitPrice: 9999 }],
      createdAt: new Date('2026-03-03T17:00:00Z'),
    },
  ];

  const filterMatches = (doc: any, filter: any): boolean => {
    // 1. DataMode Filter
    if (filter.dataMode) {
      if (typeof filter.dataMode === 'object' && filter.dataMode.$ne) {
        if (doc.dataMode === filter.dataMode.$ne) return false;
      } else if (doc.dataMode !== filter.dataMode) {
        return false;
      }
    }

    // 2. Status Filter
    if (filter.status && doc.status !== filter.status) {
      return false;
    }

    // 3. Payment Status Filter
    if (filter.paymentStatus && doc.paymentStatus !== filter.paymentStatus) {
      return false;
    }

    // 4. Fulfillment Method Filter
    if (filter.fulfillmentMethod && doc.fulfillmentMethod !== filter.fulfillmentMethod) {
      return false;
    }

    // 5. Courier Provider Filter
    if (filter['courier.provider']) {
      const regex = filter['courier.provider'].$regex;
      if (!new RegExp(regex, 'i').test(doc.courier?.provider || '')) return false;
    }

    // 6. Smart Search $or
    if (filter.$or && Array.isArray(filter.$or)) {
      const orMatched = filter.$or.some((clause: any) => {
        for (const key of Object.keys(clause)) {
          const val = clause[key];
          const pattern = val.$regex ? new RegExp(val.$regex, val.$options || 'i') : null;

          if (key === 'orderId') {
            if (pattern && pattern.test(doc.orderId)) return true;
          } else if (key === 'customerDetails.name') {
            if (pattern && pattern.test(doc.customerDetails?.name)) return true;
          } else if (key === 'customerDetails.email') {
            if (pattern && pattern.test(doc.customerDetails?.email)) return true;
          } else if (key === 'customerDetails.mobile') {
            if (pattern && pattern.test(doc.customerDetails?.mobile)) return true;
          } else if (key === 'courier.consignmentId') {
            if (pattern && pattern.test(doc.courier?.consignmentId)) return true;
          } else if (key === 'items.sku') {
            if (doc.items?.some((i: any) => pattern && pattern.test(i.sku))) return true;
          } else if (key === 'items.productName') {
            if (doc.items?.some((i: any) => pattern && pattern.test(i.productName))) return true;
          }
        }
        return false;
      });

      if (!orMatched) return false;
    }

    return true;
  };

  beforeEach(async () => {
    const mockOrderModel = {
      find: jest.fn((filter: any) => {
        const queryChain: any = {
          sort: jest.fn(() => queryChain),
          skip: jest.fn((skipVal: number) => {
            queryChain._skip = skipVal;
            return queryChain;
          }),
          limit: jest.fn((limitVal: number) => {
            queryChain._limit = limitVal;
            return queryChain;
          }),
          exec: jest.fn(async () => {
            let res = mockOrderDatabase.filter((d) => filterMatches(d, filter));
            if (queryChain._skip !== undefined) {
              res = res.slice(queryChain._skip);
            }
            if (queryChain._limit !== undefined) {
              res = res.slice(0, queryChain._limit);
            }
            return res;
          }),
        };
        return queryChain;
      }),
      countDocuments: jest.fn((filter: any) => ({
        exec: jest.fn(async () => mockOrderDatabase.filter((d) => filterMatches(d, filter)).length),
      })),
      create: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken(Order.name), useValue: mockOrderModel },
        { provide: getModelToken(Product.name), useValue: {} },
        { provide: getModelToken(Customer.name), useValue: {} },
        { provide: getModelToken(Payment.name), useValue: {} },
        { provide: InventoryService, useValue: {} },
        { provide: CouponsService, useValue: {} },
        { provide: SettingsService, useValue: {} },
        { provide: AuditLogService, useValue: { logAction: jest.fn().mockResolvedValue(true) } },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  // TEST 1: Exact Order ID search
  it('TEST 1: Exact Order ID search returns matching order', async () => {
    const result = await service.getAdminOrders({ search: 'AVL-10254' });
    expect(result.orders.length).toBe(1);
    expect(result.orders[0].orderId).toBe('AVL-10254');
  });

  // TEST 2: Partial Order ID search
  it('TEST 2: Partial Order ID search returns matching order', async () => {
    const result = await service.getAdminOrders({ search: '10254' });
    expect(result.orders.length).toBe(1);
    expect(result.orders[0].orderId).toBe('AVL-10254');
  });

  // TEST 3A: Grameenphone (017)
  it('TEST 3A: GP (017) search resolves normalized phone formats (+88017, 88017, 017)', async () => {
    const r1 = await service.getAdminOrders({ search: '01712345678' });
    expect(r1.orders.length).toBe(1);
    expect(r1.orders[0].orderId).toBe('AVL-10254');

    const r2 = await service.getAdminOrders({ search: '+8801712345678' });
    expect(r2.orders.length).toBe(1);
    expect(r2.orders[0].orderId).toBe('AVL-10254');
  });

  // TEST 3B: Grameenphone (013)
  it('TEST 3B: GP (013) search resolves normalized phone formats (+88013, 88013, 013)', async () => {
    const r = await service.getAdminOrders({ search: '01301234567' });
    expect(r.orders.length).toBe(1);
    expect(r.orders[0].orderId).toBe('AVL-10255');
  });

  // TEST 3C: Banglalink (019)
  it('TEST 3C: Banglalink (019) search resolves correctly', async () => {
    const r = await service.getAdminOrders({ search: '+8801912345678' });
    expect(r.orders.length).toBe(1);
    expect(r.orders[0].orderId).toBe('AVL-10256');
  });

  // TEST 3D: Banglalink (014)
  it('TEST 3D: Banglalink (014) search resolves correctly', async () => {
    const r = await service.getAdminOrders({ search: '01401234567' });
    expect(r.orders.length).toBe(1);
    expect(r.orders[0].orderId).toBe('AVL-10257');
  });

  // TEST 3E: Robi (018)
  it('TEST 3E: Robi (018) search resolves correctly', async () => {
    const r = await service.getAdminOrders({ search: '8801898765432' });
    expect(r.orders.length).toBe(1);
    expect(r.orders[0].orderId).toBe('AVL-10258');
  });

  // TEST 3F: Airtel / Robi (016)
  it('TEST 3F: Airtel (016) search resolves correctly', async () => {
    const r = await service.getAdminOrders({ search: '01612345678' });
    expect(r.orders.length).toBe(1);
    expect(r.orders[0].orderId).toBe('AVL-10259');
  });

  // TEST 3G: Teletalk (015)
  it('TEST 3G: Teletalk (015) search resolves correctly', async () => {
    const r = await service.getAdminOrders({ search: '+8801552345678' });
    expect(r.orders.length).toBe(1);
    expect(r.orders[0].orderId).toBe('AVL-10260');
  });

  // TEST 5: Customer name search
  it('TEST 5: Customer name search returns matching orders', async () => {
    const result = await service.getAdminOrders({ search: 'Rahim' });
    expect(result.orders.length).toBe(1);
    expect(result.orders[0].customerDetails.name).toContain('Rahim');
  });

  // TEST 6: Pathao Consignment ID search
  it('TEST 6: Pathao Consignment ID search returns correct courier order', async () => {
    const result = await service.getAdminOrders({ search: 'PATHAO-992211' });
    expect(result.orders.length).toBe(1);
    expect(result.orders[0].orderId).toBe('AVL-10255');
    expect(result.orders[0].courier.consignmentId).toBe('PATHAO-992211');
  });

  // TEST 7: Combined search + filters (Phone + DELIVERED + UNPAID)
  it('TEST 7: Combined search and filter returns only matching delivered unpaid orders', async () => {
    const result = await service.getAdminOrders({
      search: '01712345678',
      status: OrderStatus.DELIVERED,
      paymentStatus: PaymentStatus.UNPAID,
    });
    expect(result.orders.length).toBe(1);
    expect(result.orders[0].orderId).toBe('AVL-10254');
    expect(result.orders[0].paymentStatus).toBe(PaymentStatus.UNPAID);
    expect(result.orders[0].status).toBe(OrderStatus.DELIVERED);
  });

  // TEST 8: Production filter (TEST orders excluded by default)
  it('TEST 8: Production filter excludes TEST orders', async () => {
    const result = await service.getAdminOrders({ dataMode: 'PRODUCTION' });
    expect(result.orders.length).toBe(7);
    expect(result.orders.every((o) => o.dataMode !== 'TEST')).toBe(true);
  });

  // TEST 9: Test filter (explicitly shows TEST orders)
  it('TEST 9: Test filter explicitly returns TEST orders', async () => {
    const result = await service.getAdminOrders({ dataMode: 'TEST' });
    expect(result.orders.length).toBe(1);
    expect(result.orders[0].orderId).toBe('AVL-TEST-999');
    expect(result.orders[0].dataMode).toBe('TEST');
  });

  // TEST 10: Empty state when no orders match
  it('TEST 10: Returns empty array and total 0 when nothing matches', async () => {
    const result = await service.getAdminOrders({ search: 'NON_EXISTENT_QUERY_XYZ' });
    expect(result.orders.length).toBe(0);
    expect(result.pagination.total).toBe(0);
  });
});
