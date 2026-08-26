import { Model } from 'mongoose';
import { Expense, ExpenseDocument } from '../../schemas/expense.schema';
import { Order, OrderDocument, OrderStatus, CourierSettlementStatus } from '../../schemas/order.schema';
import { ProductDocument } from '../../schemas/product.schema';
import { SupplierDocument } from '../../schemas/supplier.schema';
import { PurchaseOrderDocument } from '../../schemas/purchase.schema';
import { CapitalTransactionDocument } from '../../schemas/capital.schema';
import { CourierSettlement, CourierSettlementDocument } from '../../schemas/courier-settlement.schema';
import { PaymentDocument } from '../../schemas/payment.schema';
import { ReturnRequestDocument } from '../../schemas/return-request.schema';
import { AuditLogService } from '../audit-log/audit-log.service';
export declare class FinanceService {
    private expenseModel;
    private orderModel;
    private productModel;
    private supplierModel;
    private purchaseModel;
    private capitalModel;
    private settlementModel;
    private paymentModel;
    private returnModel;
    private auditLogService;
    constructor(expenseModel: Model<ExpenseDocument>, orderModel: Model<OrderDocument>, productModel: Model<ProductDocument>, supplierModel: Model<SupplierDocument>, purchaseModel: Model<PurchaseOrderDocument>, capitalModel: Model<CapitalTransactionDocument>, settlementModel: Model<CourierSettlementDocument>, paymentModel: Model<PaymentDocument>, returnModel: Model<ReturnRequestDocument>, auditLogService: AuditLogService);
    getExpenses(query: {
        category?: string;
        limit?: number;
    }): Promise<(import("mongoose").Document<unknown, {}, ExpenseDocument, {}, import("mongoose").DefaultSchemaOptions> & Expense & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    createExpense(data: Partial<Expense>, actor?: string): Promise<Expense>;
    deleteExpense(id: string, actor?: string): Promise<{
        success: boolean;
    }>;
    getFinancialAnalytics(): Promise<{
        summary: {
            totalOrders: number;
            deliveredOrdersCount: number;
            pipelineOrdersCount: number;
            cancelledOrdersCount: number;
            returnedOrdersCount: number;
            realizedRevenue: number;
            deliveredSubtotal: number;
            deliveredCostOfGoods: number;
            grossProfit: number;
            grossProfitMargin: string;
            totalOperatingExpenses: number;
            netProfit: number;
            netProfitMargin: string;
            cashCollected: number;
            codReceivable: number;
            pipelineRevenue: number;
            totalPlacedValue: number;
            averageOrderValue: number;
            returnRate: string;
            inventoryValueAtCost: number;
            inventoryPotentialRetail: number;
            totalStockUnits: number;
            lowStockCount: number;
            outOfStockCount: number;
        };
        actionCenter: {
            unconfirmedOrders: number;
            staleOrders: number;
            outOfStockVariants: number;
            lowStockVariants: number;
            returnRequestsPending: number;
            codSettlementPendingAmount: number;
        };
        expensesByCategory: Record<string, number>;
        orderStatusCounts: Record<string, number>;
        dailySales: {
            date: string;
            sales: number;
            orders: number;
            grossProfit: number;
            netProfit: number;
        }[];
        recentExpenses: (import("mongoose").Document<unknown, {}, ExpenseDocument, {}, import("mongoose").DefaultSchemaOptions> & Expense & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    getDetailedPnL(query: {
        from?: string;
        to?: string;
    }): Promise<{
        period: {
            from: string;
            to: string;
        };
        deliveredOrdersCount: number;
        revenueSection: {
            grossProductSales: number;
            productDiscounts: number;
            couponDiscounts: number;
            returnedMerchandiseValue: number;
            netProductSales: number;
            shippingCollected: number;
            netTotalRevenue: number;
        };
        cogsSection: {
            recognizedCogs: number;
            grossProfit: number;
            grossMarginPercent: string;
        };
        logisticsAndDirectCosts: {
            actualCourierCost: number;
            packagingExpense: number;
            paymentFees: number;
            shippingContribution: number;
            contributionProfit: number;
        };
        overheadSection: {
            marketingExpense: number;
            salaryExpense: number;
            utilityExpense: number;
            otherOperatingExpense: number;
            totalOverhead: number;
        };
        finalNetProfit: {
            netProfit: number;
            netMarginPercent: string;
        };
    }>;
    getCashFlow(): Promise<{
        inflows: {
            customerAdvancePaid: number;
            codSettledFromDelivered: number;
            capitalIn: number;
            totalCashIn: number;
        };
        outflows: {
            supplierPaid: number;
            operatingExpensesPaid: number;
            capitalWithdrawals: number;
            totalCashOut: number;
        };
        netCashPosition: number;
        summary: {
            cashInHandAndBank: number;
            totalInflow: number;
            totalOutflow: number;
        };
    }>;
    getInventoryValuation(): Promise<{
        summary: {
            totalPhysicalStock: number;
            totalReservedStock: number;
            totalAvailableStock: number;
            totalStockInvestmentAtCost: number;
            totalPotentialRetailValue: number;
            potentialGrossProfit: number;
            overallMarginPercent: string;
            totalSkus: number;
        };
        skuBreakdown: any[];
    }>;
    getReconciliation(): Promise<{
        kpis: {
            deliveredCodOrdersCount: number;
            totalDeliveredCodDue: number;
            totalSettledAmount: number;
            totalCourierFees: number;
            outstandingCodReceivable: number;
            totalDisputedAmount: number;
        };
        orders: {
            _id: import("mongoose").Types.ObjectId;
            orderId: string;
            customerName: string;
            customerMobile: string;
            customerDistrict: string;
            consignmentId: string;
            courierProvider: string;
            orderStatus: OrderStatus;
            deliveryDate: any;
            codCollected: number;
            courierFee: number;
            returnFee: number;
            expectedSettlement: number;
            actualSettlement: number;
            settlementDate: Date | null;
            bankAccount: string;
            transactionRef: string;
            variance: number;
            settlementStatus: CourierSettlementStatus;
            discrepancyNote: string;
        }[];
        settlementBatches: (import("mongoose").Document<unknown, {}, CourierSettlementDocument, {}, import("mongoose").DefaultSchemaOptions> & CourierSettlement & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        gatewayReconciliation: {
            totalDigitalOrders: number;
            matchedStatus: string;
        };
    }>;
    reconcileCourierOrder(payload: {
        orderId: string;
        actualSettlement: number;
        courierFee?: number;
        returnFee?: number;
        settlementAccount: string;
        transactionRef?: string;
        settledAt?: string | Date;
        status: CourierSettlementStatus;
        notes?: string;
    }, actorEmail?: string): Promise<{
        success: boolean;
        order: import("mongoose").Document<unknown, {}, OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    bulkReconcileCourier(payload: {
        settlementBatchId: string;
        provider?: string;
        settlementAccount: string;
        transactionRef?: string;
        settledAt?: string | Date;
        items: Array<{
            orderIdOrConsignment: string;
            codCollected?: number;
            courierFee?: number;
            returnFee?: number;
            actualSettlement: number;
            status?: string;
            notes?: string;
        }>;
    }, actorEmail?: string): Promise<{
        success: boolean;
        batchId: string;
        totalNetRemitted: number;
        reconciledOrdersCount: number;
        updatedOrders: string[];
    }>;
    exportReportCsv(type: string): Promise<string>;
}
