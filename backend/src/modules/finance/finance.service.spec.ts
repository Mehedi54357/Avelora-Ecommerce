import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { FinanceService } from './finance.service';
import { Expense } from '../../schemas/expense.schema';
import { Order, OrderStatus } from '../../schemas/order.schema';
import { Product } from '../../schemas/product.schema';
import { Supplier } from '../../schemas/supplier.schema';
import { PurchaseOrder } from '../../schemas/purchase.schema';
import { CapitalTransaction, CapitalTransactionType } from '../../schemas/capital.schema';
import { CourierSettlement } from '../../schemas/courier-settlement.schema';
import { Payment } from '../../schemas/payment.schema';
import { ReturnRequest } from '../../schemas/return-request.schema';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('FinanceService - Management P&L and Working Capital', () => {
  let service: FinanceService;
  let mockExpenseModel: any;
  let mockOrderModel: any;
  let mockProductModel: any;
  let mockSupplierModel: any;
  let mockPurchaseModel: any;
  let mockCapitalModel: any;
  let mockSettlementModel: any;
  let mockPaymentModel: any;
  let mockReturnModel: any;
  let mockAuditLogService: any;

  beforeEach(async () => {
    mockExpenseModel = {
      find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
      create: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };
    mockOrderModel = {
      find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
    };
    mockProductModel = {
      find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
    };
    mockSupplierModel = {
      find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
    };
    mockPurchaseModel = {
      find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
    };
    mockCapitalModel = {
      find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
    };
    mockSettlementModel = {
      find: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }) }) }),
    };
    mockPaymentModel = {
      find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
    };
    mockReturnModel = {
      find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
    };
    mockAuditLogService = {
      logAction: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        { provide: getModelToken(Expense.name), useValue: mockExpenseModel },
        { provide: getModelToken(Order.name), useValue: mockOrderModel },
        { provide: getModelToken(Product.name), useValue: mockProductModel },
        { provide: getModelToken(Supplier.name), useValue: mockSupplierModel },
        { provide: getModelToken(PurchaseOrder.name), useValue: mockPurchaseModel },
        { provide: getModelToken(CapitalTransaction.name), useValue: mockCapitalModel },
        { provide: getModelToken(CourierSettlement.name), useValue: mockSettlementModel },
        { provide: getModelToken(Payment.name), useValue: mockPaymentModel },
        { provide: getModelToken(ReturnRequest.name), useValue: mockReturnModel },
        { provide: AuditLogService, useValue: mockAuditLogService },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate authentic P&L recognizing revenue and COGS only on delivered orders', async () => {
    const mockOrders = [
      {
        orderId: 'AVE-001',
        status: OrderStatus.DELIVERED,
        subtotal: 5000,
        discount: 500,
        couponDiscount: 0,
        deliveryCharge: 70,
        totalAmount: 4570,
        courier: { charge: 60 },
        items: [
          { sku: 'AVE-101', quantity: 1, costPrice: 2000 },
        ],
      },
    ];

    const mockExpenses = [
      { title: 'Meta Ads', category: 'Marketing', amount: 500 },
    ];

    mockOrderModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockOrders) });
    mockExpenseModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockExpenses) });

    const pnl = await service.getDetailedPnL({});

    expect(pnl.deliveredOrdersCount).toBe(1);
    expect(pnl.revenueSection.grossProductSales).toBe(5000);
    expect(pnl.revenueSection.netProductSales).toBe(4500); // 5000 - 500 discount
    expect(pnl.cogsSection.recognizedCogs).toBe(2000);
    expect(pnl.cogsSection.grossProfit).toBe(2500); // 4500 - 2000
    expect(pnl.overheadSection.marketingExpense).toBe(500);
    expect(pnl.finalNetProfit.netProfit).toBe(2010); // Contribution (2500 + 10 shipping margin) - 500 marketing = 2010
  });
});
