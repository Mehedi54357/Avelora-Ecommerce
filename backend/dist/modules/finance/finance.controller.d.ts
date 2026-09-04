import { FinanceService } from './finance.service';
import type { Response } from 'express';
export declare class FinanceController {
    private readonly financeService;
    constructor(financeService: FinanceService);
    getBusinessPerformance(query: {
        range?: string;
        startDate?: string;
        endDate?: string;
        categoryId?: string;
        productId?: string;
        variantSku?: string;
        search?: string;
    }): Promise<{
        period: {
            range: string;
            from: string;
            to: string;
        };
        allBusiness: {
            purchasedQty: number;
            purchaseInvestment: number;
            soldQty: number;
            revenue: number;
            cogs: number;
            grossProfit: number;
            grossMarginPercent: number;
            physicalStock: number;
            reservedStock: number;
            availableStock: number;
            inventoryValue: number;
            returnQty: number;
            damageQty: number;
            damageLoss: number;
            capitalRecoveryPercent: number;
        };
        capitalAllocation: {
            currentInventoryAsset: number;
            courierCodReceivable: number;
            settledCashAndBank: number;
            totalWorkingCapital: number;
            inventoryCostRecoveredThroughSales: number;
        };
        insights: {
            topRevenueCategory: {
                name: any;
                revenue: any;
            };
            mostProfitableCategory: {
                name: any;
                grossProfit: any;
            };
            highestMarginCategory: {
                name: any;
                margin: any;
            };
            mostCapitalInStockCategory: {
                name: any;
                inventoryValue: any;
            };
            fastestSellingProduct: {
                name: any;
                soldQty: any;
                revenue: any;
            };
            topProfitProduct: {
                name: any;
                grossProfit: any;
            };
            highestReturnProduct: {
                name: any;
                returnQty: any;
            };
        };
        categoryChartData: {
            categoryId: any;
            categoryName: any;
            revenue: any;
            grossProfit: any;
            inventoryValue: any;
            grossMarginPercent: any;
        }[];
        categories: any[];
        slowMovingStock: any[];
        reconciliation: {
            isReconciled: boolean;
            businessMatchesCategories: boolean;
            categoryRevenueSum: number;
            categoryCogsSum: number;
            categoryGrossProfitSum: number;
            categoryInvestmentSum: number;
            categoryStockSum: number;
            categoryInventoryValueSum: number;
        };
    }>;
    exportBusinessPerformance(res: Response): Promise<Response<any, Record<string, any>>>;
    getAnalytics(): Promise<{
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
        recentExpenses: (import("mongoose").Document<unknown, {}, import("../../schemas/expense.schema").ExpenseDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/expense.schema").Expense & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
            orderStatus: import("../../schemas/order.schema").OrderStatus;
            deliveryDate: any;
            codCollected: number;
            courierFee: number;
            returnFee: number;
            expectedSettlement: number;
            actualSettlement: number;
            settlementDate: Date;
            bankAccount: string;
            transactionRef: string;
            variance: number;
            settlementStatus: import("../../schemas/order.schema").CourierSettlementStatus;
            discrepancyNote: string;
        }[];
        settlementBatches: (import("mongoose").Document<unknown, {}, import("../../schemas/courier-settlement.schema").CourierSettlementDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/courier-settlement.schema").CourierSettlement & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
    reconcileCourierOrder(body: any, req: any): Promise<{
        success: boolean;
        order: import("mongoose").Document<unknown, {}, import("../../schemas/order.schema").OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/order.schema").Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    bulkReconcileCourier(body: any, req: any): Promise<{
        success: boolean;
        batchId: string;
        totalNetRemitted: number;
        reconciledOrdersCount: number;
        updatedOrders: string[];
    }>;
    getExpenses(query: {
        category?: string;
        limit?: number;
    }): Promise<(import("mongoose").Document<unknown, {}, import("../../schemas/expense.schema").ExpenseDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/expense.schema").Expense & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    createExpense(body: any, req: any): Promise<import("../../schemas/expense.schema").Expense>;
    deleteExpense(id: string, req: any): Promise<{
        success: boolean;
    }>;
    exportReport(type: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
