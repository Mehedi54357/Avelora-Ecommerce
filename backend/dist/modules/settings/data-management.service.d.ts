import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { Order, OrderDocument } from '../../schemas/order.schema';
import { InventoryTransactionDocument } from '../../schemas/inventory-transaction.schema';
import { PaymentDocument } from '../../schemas/payment.schema';
import { ReturnRequestDocument } from '../../schemas/return-request.schema';
import { InventoryService } from '../inventory/inventory.service';
import { AuditLogService } from '../audit-log/audit-log.service';
export declare class DataManagementService {
    private productModel;
    private orderModel;
    private txnModel;
    private paymentModel;
    private returnModel;
    private readonly inventoryService;
    private readonly auditLogService;
    private readonly logger;
    constructor(productModel: Model<ProductDocument>, orderModel: Model<OrderDocument>, txnModel: Model<InventoryTransactionDocument>, paymentModel: Model<PaymentDocument>, returnModel: Model<ReturnRequestDocument>, inventoryService: InventoryService, auditLogService: AuditLogService);
    getTestDataSummary(): Promise<{
        testProductsCount: number;
        testOrdersCount: number;
        testTxnsCount: number;
        testReservationsCount: number;
        testPaymentsCount: number;
        testReturnsCount: number;
        testProducts: (Product & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        testOrders: (Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
    }>;
    cleanupTestData(payload: {
        confirmationText: string;
        selectedProductIds?: string[];
        selectedOrderIds?: string[];
        cleanAll?: boolean;
    }, actorId?: string): Promise<{
        success: boolean;
        deletedOrdersCount: number;
        deletedProductsCount: number;
        message: string;
    }>;
}
