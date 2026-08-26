import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PurchasesService } from './purchases.service';
import { Supplier } from '../../schemas/supplier.schema';
import { PurchaseOrder, PurchaseStatus } from '../../schemas/purchase.schema';
import { Product } from '../../schemas/product.schema';
import { InventoryTransaction } from '../../schemas/inventory-transaction.schema';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('PurchasesService - GRN & Weighted-Average Costing', () => {
  let service: PurchasesService;
  let mockSupplierModel: any;
  let mockPurchaseModel: any;
  let mockProductModel: any;
  let mockTransactionModel: any;
  let mockAuditLogService: any;

  beforeEach(async () => {
    mockSupplierModel = {
      find: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }) }),
      findById: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };

    mockPurchaseModel = function (dto: any) {
      return {
        ...dto,
        _id: 'po_123',
        save: jest.fn().mockResolvedValue(true),
      };
    };
    mockPurchaseModel.find = jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }) });
    mockPurchaseModel.findById = jest.fn();
    mockPurchaseModel.countDocuments = jest.fn().mockResolvedValue(5);

    mockProductModel = {
      findById: jest.fn(),
    };

    mockTransactionModel = {
      create: jest.fn().mockResolvedValue(true),
    };

    mockAuditLogService = {
      logAction: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasesService,
        { provide: getModelToken(Supplier.name), useValue: mockSupplierModel },
        { provide: getModelToken(PurchaseOrder.name), useValue: mockPurchaseModel },
        { provide: getModelToken(Product.name), useValue: mockProductModel },
        { provide: getModelToken(InventoryTransaction.name), useValue: mockTransactionModel },
        { provide: AuditLogService, useValue: mockAuditLogService },
      ],
    }).compile();

    service = module.get<PurchasesService>(PurchasesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should accurately calculate weighted-average acquisition cost on goods receipt (GRN)', async () => {
    const mockPO = {
      _id: 'po_001',
      purchaseId: 'PO-20260826-001',
      supplierId: 'sup_001',
      supplierName: 'Artisan Mill Fabrics',
      status: PurchaseStatus.PENDING,
      totalCost: 15000,
      paidAmount: 15000,
      dueAmount: 0,
      additionalCost: 0,
      items: [
        {
          productId: 'prod_001',
          sku: 'AVE-101',
          quantity: 10,
          unitCost: 1500,
        },
      ],
      save: jest.fn().mockResolvedValue(true),
    };

    const mockProduct = {
      _id: 'prod_001',
      name: 'Royal Velvet Panjabi',
      variants: [
        {
          sku: 'AVE-101',
          stockQuantity: 10,
          costPrice: 1000,
          weightedAverageCost: 1000,
        },
      ],
      markModified: jest.fn(),
      save: jest.fn().mockResolvedValue(true),
    };

    const mockSupplier = {
      _id: 'sup_001',
      totalPurchased: 0,
      totalPaid: 0,
      totalDue: 0,
      save: jest.fn().mockResolvedValue(true),
    };

    mockPurchaseModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockPO) });
    mockProductModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockProduct) });
    mockSupplierModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockSupplier) });

    const result = await service.receiveGoods('po_001', 'admin@avelora.com');

    expect(result.success).toBe(true);
    // Old: 10 units @ 1000 = 10,000. New: 10 units @ 1500 = 15,000. Total 20 units = 25,000 / 20 = 1,250 WAC
    expect(mockProduct.variants[0].stockQuantity).toBe(20);
    expect(mockProduct.variants[0].weightedAverageCost).toBe(1250);
    expect(mockProduct.variants[0].costPrice).toBe(1500);
    expect(mockTransactionModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        variantSku: 'AVE-101',
        quantityChange: 10,
        previousQuantity: 10,
        newQuantity: 20,
      }),
    );
  });
});
