import { Model } from 'mongoose';
import { OrderDocument } from '../../schemas/order.schema';
import { ProductDocument } from '../../schemas/product.schema';
import { ExpenseDocument } from '../../schemas/expense.schema';
import { ReturnRequestDocument } from '../../schemas/return-request.schema';
import { FinanceService } from '../finance/finance.service';
import { AuditLogService } from '../audit-log/audit-log.service';
export declare class DashboardService {
    private orderModel;
    private productModel;
    private expenseModel;
    private returnModel;
    private financeService;
    private auditLogService;
    constructor(orderModel: Model<OrderDocument>, productModel: Model<ProductDocument>, expenseModel: Model<ExpenseDocument>, returnModel: Model<ReturnRequestDocument>, financeService: FinanceService, auditLogService: AuditLogService);
    getDashboardSummary(queryRange?: string): Promise<{
        executiveSummary: {
            totalRevenue: any;
            totalOrders: number;
            grossProfit: any;
            netProfit: any;
            codReceivable: any;
            lowStockItems: number;
            criticalStockItems: number;
            trends: {
                revenue: string;
                revenuePositive: boolean;
                orders: string;
                ordersPositive: boolean;
                grossProfit: string;
                grossProfitPositive: boolean;
                netProfit: string;
                netProfitPositive: boolean;
                codReceivable: string;
                codReceivablePositive: boolean;
            };
        };
        actionRequired: {
            unconfirmedOrders: number;
            staleOrders: number;
            outOfStockSKUs: number;
            lowStockSKUs: number;
            returnRequests: number;
            pendingCodDue: any;
        };
        salesOverview: {
            timeRange: string;
            daily: {
                date: string;
                label: string;
                sales: number;
                orders: number;
                grossProfit: number;
            }[];
            maxDailySales: number;
            totalPeriodSales: number;
        };
        orderStatus: {
            delivered: {
                count: number;
                percentage: number;
            };
            inTransit: {
                count: number;
                percentage: number;
            };
            processing: {
                count: number;
                percentage: number;
            };
            pending: {
                count: number;
                percentage: number;
            };
            cancelled: {
                count: number;
                percentage: number;
            };
            totalCount: number;
        };
        recentOrders: {
            _id: any;
            orderId: any;
            customer: any;
            amount: any;
            payment: any;
            courier: any;
            status: string;
            rawStatus: any;
            date: string;
        }[];
        topProducts: {
            id: string;
            name: string;
            image: string;
            unitsSold: number;
            revenue: number;
            rank: number;
        }[];
        courierSummary: {
            _id: any;
            orderId: any;
            courier: any;
            trackingId: any;
            status: string;
            trackingUrl: any;
        }[];
        inventorySummary: {
            totalProducts: number;
            totalVariants: number;
            totalStock: number;
            lowStock: number;
            outOfStock: number;
            reservedStock: number;
        };
        financialOverview: {
            totalRevenue: any;
            totalCogs: any;
            grossProfit: any;
            totalExpenses: any;
            netProfit: any;
            netProfitMargin: number;
        };
        recentAuditLogs: {
            _id: any;
            date: string;
            time: string;
            activity: any;
            user: any;
            role: any;
        }[];
    }>;
}
