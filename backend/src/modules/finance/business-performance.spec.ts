import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { FinanceService } from './finance.service';
import { Expense } from '../../schemas/expense.schema';
import { Order, OrderStatus, CourierSettlementStatus } from '../../schemas/order.schema';
import { Product } from '../../schemas/product.schema';
import { Category } from '../../schemas/category.schema';
import { Supplier } from '../../schemas/supplier.schema';
import { PurchaseOrder, PurchaseStatus } from '../../schemas/purchase.schema';
import { CapitalTransaction, CapitalTransactionType } from '../../schemas/capital.schema';
import { CourierSettlement } from '../../schemas/courier-settlement.schema';
import { Payment } from '../../schemas/payment.schema';
import { ReturnRequest, ReturnStatus } from '../../schemas/return-request.schema';
import { InventoryTransaction } from '../../schemas/inventory-transaction.schema';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('Business Owner Profitability, Investment & Inventory Intelligence (Deep Analysis)', () => {
  let service: FinanceService;

  // Mock collections in-memory fixtures
  let mockProducts: any[] = [];
  let mockCategories: any[] = [];
  let mockPurchases: any[] = [];
  let mockOrders: any[] = [];
  let mockReturns: any[] = [];
  let mockInventoryTxns: any[] = [];
  let mockExpenses: any[] = [];
  let mockCapital: any[] = [];

  const createMockModel = (getData: () => any[]) => {
    const applyFilter = (filter?: any) => {
      let data = getData();
      if (filter && filter.dataMode && filter.dataMode.$ne === 'TEST') {
        data = data.filter((item: any) => item.dataMode !== 'TEST');
      }
      return data;
    };

    const createQueryChain = (filter?: any) => {
      const chain: any = {
        populate: jest.fn().mockImplementation(() => chain),
        sort: jest.fn().mockImplementation(() => chain),
        limit: jest.fn().mockImplementation(() => chain),
        select: jest.fn().mockImplementation(() => chain),
        lean: jest.fn().mockImplementation(() => chain),
        exec: jest.fn().mockImplementation(async () => applyFilter(filter)),
      };
      return chain;
    };

    return {
      find: jest.fn().mockImplementation((filter?: any) => createQueryChain(filter)),
      findOne: jest.fn().mockImplementation((filter?: any) => createQueryChain(filter)),
      findById: jest.fn().mockImplementation((filter?: any) => createQueryChain(filter)),
      countDocuments: jest.fn().mockReturnValue({
        exec: jest.fn().mockImplementation(async () => getData().length),
      }),
      distinct: jest.fn().mockReturnValue({
        exec: jest.fn().mockImplementation(async () => []),
      }),
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockImplementation(async () => getData()),
      }),
      create: jest.fn().mockImplementation(async (doc: any) => ({ _id: 'mock-id', ...(doc || {}) })),
      deleteMany: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      }),
      updateOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      }),
      updateMany: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      }),
    };
  };

  beforeEach(async () => {
    mockProducts = [];
    mockCategories = [];
    mockPurchases = [];
    mockOrders = [];
    mockReturns = [];
    mockInventoryTxns = [];
    mockExpenses = [];
    mockCapital = [];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        { provide: getModelToken(Expense.name), useValue: createMockModel(() => mockExpenses) },
        { provide: getModelToken(Order.name), useValue: createMockModel(() => mockOrders) },
        { provide: getModelToken(Product.name), useValue: createMockModel(() => mockProducts) },
        { provide: getModelToken(Category.name), useValue: createMockModel(() => mockCategories) },
        { provide: getModelToken(Supplier.name), useValue: createMockModel(() => []) },
        { provide: getModelToken(PurchaseOrder.name), useValue: createMockModel(() => mockPurchases) },
        { provide: getModelToken(CapitalTransaction.name), useValue: createMockModel(() => mockCapital) },
        { provide: getModelToken(CourierSettlement.name), useValue: createMockModel(() => []) },
        { provide: getModelToken(Payment.name), useValue: createMockModel(() => []) },
        { provide: getModelToken(ReturnRequest.name), useValue: createMockModel(() => mockReturns) },
        { provide: getModelToken(InventoryTransaction.name), useValue: createMockModel(() => mockInventoryTxns) },
        { provide: AuditLogService, useValue: { logAction: jest.fn().mockResolvedValue(true) } },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
  });

  // =========================================================================
  // 1. Core Acceptance Test: Controlled Flow (100 Purchased, 20 Sold)
  // =========================================================================
  describe('1. Acceptance Test - Controlled Unit Economics & Unsold Inventory', () => {
    it('accurately calculates 100 purchased @ ৳250 and 20 sold @ ৳350 without treating unsold stock as expense', async () => {
      const catId = 'cat-hijab-1';
      mockCategories = [{ _id: catId, name: 'Hijab', slug: 'hijab', department: 'women' }];

      mockProducts = [
        {
          _id: 'prod-silk-1',
          name: 'Premium Silk Hijab',
          slug: 'premium-silk-hijab',
          categoryId: mockCategories[0],
          salePrice: 350,
          originalPrice: 400,
          variants: [
            {
              sku: 'HIJ-SLK-BLK',
              color: 'Black',
              size: 'Standard',
              price: 350,
              costPrice: 250,
              weightedAverageCost: 250,
              stockQuantity: 80, // 100 purchased - 20 sold = 80 remaining
              reservedQuantity: 0,
            },
          ],
        },
      ];

      // 100 pcs received @ ৳250 = ৳25,000 investment
      mockPurchases = [
        {
          _id: 'po-1',
          purchaseId: 'PO-2026-001',
          status: PurchaseStatus.RECEIVED,
          receivedAt: new Date('2026-01-10'),
          createdAt: new Date('2026-01-10'),
          items: [
            {
              productId: 'prod-silk-1',
              sku: 'HIJ-SLK-BLK',
              quantity: 100,
              unitCost: 250,
              totalCost: 25000,
            },
          ],
        },
      ];

      // 20 pcs recognized sold @ ৳350 = ৳7,000 recognized sales, COGS = ৳5,000
      mockOrders = [
        {
          _id: 'ord-1',
          orderId: 'AVE-20260115-001',
          status: OrderStatus.DELIVERED,
          createdAt: new Date('2026-01-15'),
          subtotal: 7000,
          totalAmount: 7070,
          items: [
            {
              productId: 'prod-silk-1',
              sku: 'HIJ-SLK-BLK',
              quantity: 20,
              unitPrice: 350,
              costPrice: 250,
            },
          ],
        },
      ];

      const result = await service.getBusinessPerformance({ range: 'all' });

      expect(result.allBusiness.purchasedQty).toBe(100);
      expect(result.allBusiness.purchaseInvestment).toBe(25000);
      expect(result.allBusiness.soldQty).toBe(20);
      expect(result.allBusiness.revenue).toBe(7000);
      expect(result.allBusiness.cogs).toBe(5000);
      expect(result.allBusiness.grossProfit).toBe(2000);
      expect(result.allBusiness.grossMarginPercent).toBe(28.57); // (2000 / 7000) * 100 = 28.5714%
      expect(result.allBusiness.physicalStock).toBe(80);
      expect(result.allBusiness.inventoryValue).toBe(20000); // 80 * 250 = 20,000
      expect(result.allBusiness.capitalRecoveryPercent).toBe(20); // (5000 / 25000) * 100 = 20%
    });
  });

  // =========================================================================
  // 2. Multi-Category Strict Mathematical Reconciliation
  // =========================================================================
  describe('2. Multi-Category Strict Reconciliation Test', () => {
    it('verifies that SUM(Categories) === ALL BUSINESS across all accounting dimensions', async () => {
      mockCategories = [
        { _id: 'cat-1', name: 'Hijab', slug: 'hijab', department: 'women' },
        { _id: 'cat-2', name: 'Churi', slug: 'churi', department: 'women' },
        { _id: 'cat-3', name: 'Abaya', slug: 'abaya', department: 'women' },
      ];

      mockProducts = [
        {
          _id: 'p-1',
          name: 'Silk Hijab',
          slug: 'silk-hijab',
          categoryId: mockCategories[0],
          variants: [
            { sku: 'SKU-H1', color: 'Black', price: 500, costPrice: 300, stockQuantity: 50, reservedQuantity: 5 },
          ],
        },
        {
          _id: 'p-2',
          name: 'Kashmiri Churi',
          slug: 'kashmiri-churi',
          categoryId: mockCategories[1],
          variants: [
            { sku: 'SKU-C1', color: 'Gold', price: 1200, costPrice: 700, stockQuantity: 30, reservedQuantity: 2 },
          ],
        },
        {
          _id: 'p-3',
          name: 'Royal Velvet Abaya',
          slug: 'royal-velvet-abaya',
          categoryId: mockCategories[2],
          variants: [
            { sku: 'SKU-A1', color: 'Emerald', price: 3500, costPrice: 2000, stockQuantity: 15, reservedQuantity: 0 },
          ],
        },
      ];

      mockPurchases = [
        {
          status: PurchaseStatus.RECEIVED,
          receivedAt: new Date('2026-02-01'),
          items: [
            { sku: 'SKU-H1', quantity: 60, unitCost: 300, totalCost: 18000 },
            { sku: 'SKU-C1', quantity: 40, unitCost: 700, totalCost: 28000 },
            { sku: 'SKU-A1', quantity: 20, unitCost: 2000, totalCost: 40000 },
          ],
        },
      ];

      mockOrders = [
        {
          status: OrderStatus.DELIVERED,
          createdAt: new Date('2026-02-10'),
          items: [
            { sku: 'SKU-H1', quantity: 10, unitPrice: 500, costPrice: 300 }, // Rev: 5000, COGS: 3000, GP: 2000
            { sku: 'SKU-C1', quantity: 10, unitPrice: 1200, costPrice: 700 }, // Rev: 12000, COGS: 7000, GP: 5000
            { sku: 'SKU-A1', quantity: 5, unitPrice: 3500, costPrice: 2000 }, // Rev: 17500, COGS: 10000, GP: 7500
          ],
        },
      ];

      const result = await service.getBusinessPerformance({ range: 'all' });

      // Total Expected:
      // Revenue = 5000 + 12000 + 17500 = 34,500
      // COGS = 3000 + 7000 + 10000 = 20,000
      // Gross Profit = 2000 + 5000 + 7500 = 14,500
      // Investment = 18000 + 28000 + 40000 = 86,000
      // Physical Stock = 50 + 30 + 15 = 95
      // Inventory Value = (50*300) + (30*700) + (15*2000) = 15000 + 21000 + 30000 = 66,000

      expect(result.allBusiness.revenue).toBe(34500);
      expect(result.allBusiness.cogs).toBe(20000);
      expect(result.allBusiness.grossProfit).toBe(14500);
      expect(result.allBusiness.purchaseInvestment).toBe(86000);
      expect(result.allBusiness.physicalStock).toBe(95);
      expect(result.allBusiness.inventoryValue).toBe(66000);

      // Verify Category Sums equal All Business
      const sumCatRevenue = result.categories.reduce((sum, c) => sum + c.revenue, 0);
      const sumCatCogs = result.categories.reduce((sum, c) => sum + c.cogs, 0);
      const sumCatGp = result.categories.reduce((sum, c) => sum + c.grossProfit, 0);
      const sumCatStock = result.categories.reduce((sum, c) => sum + c.physicalStock, 0);
      const sumCatInvVal = result.categories.reduce((sum, c) => sum + c.inventoryValue, 0);

      expect(sumCatRevenue).toBe(result.allBusiness.revenue);
      expect(sumCatCogs).toBe(result.allBusiness.cogs);
      expect(sumCatGp).toBe(result.allBusiness.grossProfit);
      expect(sumCatStock).toBe(result.allBusiness.physicalStock);
      expect(sumCatInvVal).toBe(result.allBusiness.inventoryValue);
    });
  });

  // =========================================================================
  // 3. 4-Tier Drill-Down Hierarchy (Business -> Category -> Product -> Variant)
  // =========================================================================
  describe('3. 4-Tier Drill-Down Hierarchy (Business -> Category -> Product -> Variant)', () => {
    it('verifies exact reconciliation between Product totals and Variant sums', async () => {
      const cat = { _id: 'cat-dress', name: 'Luxury Dress', slug: 'luxury-dress', department: 'women' };
      mockCategories = [cat];

      mockProducts = [
        {
          _id: 'p-dress-multi',
          name: 'Organza Party Dress',
          slug: 'organza-party-dress',
          categoryId: cat,
          variants: [
            { sku: 'DRS-BLK-S', color: 'Black', size: 'S', price: 4000, costPrice: 2200, stockQuantity: 10, reservedQuantity: 1 },
            { sku: 'DRS-BLK-M', color: 'Black', size: 'M', price: 4000, costPrice: 2200, stockQuantity: 12, reservedQuantity: 0 },
            { sku: 'DRS-WHT-S', color: 'White', size: 'S', price: 4200, costPrice: 2300, stockQuantity: 8, reservedQuantity: 2 },
            { sku: 'DRS-WHT-M', color: 'White', size: 'M', price: 4200, costPrice: 2300, stockQuantity: 10, reservedQuantity: 0 },
          ],
        },
      ];

      mockPurchases = [
        {
          status: PurchaseStatus.RECEIVED,
          receivedAt: new Date('2026-02-01'),
          items: [
            { sku: 'DRS-BLK-S', quantity: 15, unitCost: 2200, totalCost: 33000 },
            { sku: 'DRS-BLK-M', quantity: 15, unitCost: 2200, totalCost: 33000 },
            { sku: 'DRS-WHT-S', quantity: 10, unitCost: 2300, totalCost: 23000 },
            { sku: 'DRS-WHT-M', quantity: 10, unitCost: 2300, totalCost: 23000 },
          ],
        },
      ];

      mockOrders = [
        {
          status: OrderStatus.DELIVERED,
          createdAt: new Date('2026-02-12'),
          items: [
            { sku: 'DRS-BLK-S', quantity: 5, unitPrice: 4000, costPrice: 2200 },
            { sku: 'DRS-BLK-M', quantity: 3, unitPrice: 4000, costPrice: 2200 },
            { sku: 'DRS-WHT-S', quantity: 2, unitPrice: 4200, costPrice: 2300 },
          ],
        },
      ];

      const result = await service.getBusinessPerformance({ range: 'all' });
      const category = result.categories[0];
      const product = category.products[0];

      // Verify Product matches Category
      expect(category.revenue).toBe(product.revenue);
      expect(category.cogs).toBe(product.cogs);
      expect(category.grossProfit).toBe(product.grossProfit);
      expect(category.physicalStock).toBe(product.physicalStock);
      expect(category.inventoryValue).toBe(product.inventoryValue);

      // Verify Variants sum equals Product
      const sumVarRevenue = product.variants.reduce((sum: number, v: any) => sum + v.revenue, 0);
      const sumVarCogs = product.variants.reduce((sum: number, v: any) => sum + v.cogs, 0);
      const sumVarGp = product.variants.reduce((sum: number, v: any) => sum + v.grossProfit, 0);
      const sumVarStock = product.variants.reduce((sum: number, v: any) => sum + v.physicalStock, 0);
      const sumVarInvVal = product.variants.reduce((sum: number, v: any) => sum + v.inventoryValue, 0);

      expect(sumVarRevenue).toBe(product.revenue);
      expect(sumVarCogs).toBe(product.cogs);
      expect(sumVarGp).toBe(product.grossProfit);
      expect(sumVarStock).toBe(product.physicalStock);
      expect(sumVarInvVal).toBe(product.inventoryValue);
    });
  });

  // =========================================================================
  // 4. Stock Reservation & Available Quantity Analysis
  // =========================================================================
  describe('4. Stock Reservation & Available Quantity Analysis', () => {
    it('correctly reports physical stock, reserved stock, and available stock without deducting reserved units from valuation', async () => {
      const cat = { _id: 'cat-jewel', name: 'Jewellery', slug: 'jewellery', department: 'women' };
      mockCategories = [cat];

      mockProducts = [
        {
          _id: 'p-necklace',
          name: 'Gold Plated Choker',
          slug: 'gold-plated-choker',
          categoryId: cat,
          variants: [
            {
              sku: 'JWL-CHK-01',
              price: 1500,
              costPrice: 800,
              stockQuantity: 20,     // Total physical items on shelf
              reservedQuantity: 6,   // 6 items currently in pending/processing orders
            },
          ],
        },
      ];

      const result = await service.getBusinessPerformance({ range: 'all' });
      const variant = result.categories[0].products[0].variants[0];

      expect(variant.physicalStock).toBe(20);
      expect(variant.reservedStock).toBe(6);
      expect(variant.availableStock).toBe(14); // 20 physical - 6 reserved = 14 available
      expect(variant.inventoryValue).toBe(16000); // Asset valuation: 20 * 800 = 16,000
    });
  });

  // =========================================================================
  // 5. Capital Allocation & Working Capital Model
  // =========================================================================
  describe('5. Capital Allocation & Working Capital Model', () => {
    it('accurately reports inventory assets, courier receivables, and recovered capital', async () => {
      mockCategories = [{ _id: 'cat-perfume', name: 'Fragrance', slug: 'fragrance', department: 'women' }];
      mockProducts = [
        {
          _id: 'p-oud',
          name: 'Royal Arabian Oud',
          slug: 'royal-arabian-oud',
          categoryId: mockCategories[0],
          variants: [{ sku: 'OUD-ROYAL-50', price: 5000, costPrice: 2500, stockQuantity: 6, reservedQuantity: 0 }],
        },
      ];

      mockPurchases = [
        {
          status: PurchaseStatus.RECEIVED,
          receivedAt: new Date(),
          paidAmount: 25000,
          items: [{ sku: 'OUD-ROYAL-50', quantity: 10, unitCost: 2500, totalCost: 25000 }],
        },
      ];

      // 4 sold @ ৳5,000 = ৳20,000 revenue, COGS = ৳10,000
      mockOrders = [
        {
          status: OrderStatus.DELIVERED,
          paymentMethod: 'COD',
          subtotal: 20000,
          totalAmount: 20070,
          paidAmount: 70, // Advance delivery charge
          dueAmount: 20000,
          courier: {
            settlementStatus: CourierSettlementStatus.AWAITING_SETTLEMENT,
            deliveryFee: 70,
          },
          items: [{ sku: 'OUD-ROYAL-50', quantity: 4, unitPrice: 5000, costPrice: 2500 }],
        },
      ];

      // Capital In: ৳50,000
      mockCapital = [
        { type: CapitalTransactionType.OWNER_CAPITAL_IN, amount: 50000, date: new Date() },
      ];

      const result = await service.getBusinessPerformance({ range: 'all' });

      // Physical inventory remaining: 6 units @ ৳2,500 = ৳15,000
      expect(result.capitalAllocation.currentInventoryAsset).toBe(15000);
      // Courier COD pending settlement: ৳20,000
      expect(result.capitalAllocation.courierCodReceivable).toBe(20000);
      // Inventory cost recovered through sales: ৳10,000
      expect(result.capitalAllocation.inventoryCostRecoveredThroughSales).toBe(10000);
    });
  });

  // =========================================================================
  // 6. Test Data Isolation Guard
  // =========================================================================
  describe('6. Test Data Isolation Guard', () => {
    it('strictly isolates and ignores dataMode: "TEST" products and orders from production analytics', async () => {
      mockCategories = [{ _id: 'cat-test', name: 'Demo Category', slug: 'demo-category', department: 'women' }];

      mockProducts = [
        // Production product
        {
          _id: 'p-real',
          dataMode: 'PRODUCTION',
          name: 'Authentic Luxury Ring',
          slug: 'authentic-luxury-ring',
          categoryId: mockCategories[0],
          variants: [{ sku: 'RNG-REAL', price: 2000, costPrice: 1000, stockQuantity: 5, reservedQuantity: 0 }],
        },
        // Sandboxed Test product
        {
          _id: 'p-test',
          dataMode: 'TEST',
          name: 'Test Simulator Product',
          slug: 'test-simulator-product',
          categoryId: mockCategories[0],
          variants: [{ sku: 'RNG-TEST', price: 99999, costPrice: 50000, stockQuantity: 100, reservedQuantity: 0 }],
        },
      ];

      mockPurchases = [
        {
          dataMode: 'PRODUCTION',
          status: PurchaseStatus.RECEIVED,
          items: [{ sku: 'RNG-REAL', quantity: 5, unitCost: 1000, totalCost: 5000 }],
        },
        {
          dataMode: 'TEST',
          status: PurchaseStatus.RECEIVED,
          items: [{ sku: 'RNG-TEST', quantity: 100, unitCost: 50000, totalCost: 5000000 }],
        },
      ];

      mockOrders = [
        {
          dataMode: 'PRODUCTION',
          status: OrderStatus.DELIVERED,
          items: [{ sku: 'RNG-REAL', quantity: 2, unitPrice: 2000, costPrice: 1000 }],
        },
        {
          dataMode: 'TEST',
          status: OrderStatus.DELIVERED,
          items: [{ sku: 'RNG-TEST', quantity: 10, unitPrice: 99999, costPrice: 50000 }],
        },
      ];

      const result = await service.getBusinessPerformance({ range: 'all' });

      // Only real production records are recognized
      expect(result.allBusiness.purchasedQty).toBe(5);
      expect(result.allBusiness.purchaseInvestment).toBe(5000);
      expect(result.allBusiness.soldQty).toBe(2);
      expect(result.allBusiness.revenue).toBe(4000);
      expect(result.allBusiness.cogs).toBe(2000);
      expect(result.allBusiness.grossProfit).toBe(2000);
      expect(result.allBusiness.physicalStock).toBe(5);
      expect(result.allBusiness.inventoryValue).toBe(5000);
    });
  });

  // =========================================================================
  // 7. Edge Cases: Cancelled Orders & Damaged Stock Protection
  // =========================================================================
  describe('7. Edge Cases - Returns, Cancellations & Safety', () => {
    it('properly excludes cancelled orders from revenue and COGS', async () => {
      mockCategories = [{ _id: 'cat-x', name: 'General', slug: 'general', department: 'women' }];
      mockProducts = [
        {
          _id: 'p-x',
          name: 'Item X',
          slug: 'item-x',
          categoryId: mockCategories[0],
          variants: [{ sku: 'SKU-X', price: 1000, costPrice: 600, stockQuantity: 10, reservedQuantity: 0 }],
        },
      ];
      mockPurchases = [];
      mockOrders = [
        {
          status: OrderStatus.CANCELLED,
          createdAt: new Date(),
          items: [{ sku: 'SKU-X', quantity: 2, unitPrice: 1000, costPrice: 600 }],
        },
      ];

      const result = await service.getBusinessPerformance({ range: 'all' });
      expect(result.allBusiness.revenue).toBe(0);
      expect(result.allBusiness.cogs).toBe(0);
      expect(result.allBusiness.soldQty).toBe(0);
    });
  });
});
