import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../../schemas/order.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { Expense, ExpenseDocument } from '../../schemas/expense.schema';
import { ReturnRequest, ReturnRequestDocument } from '../../schemas/return-request.schema';
import { FinanceService } from '../finance/finance.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    @InjectModel(ReturnRequest.name) private returnModel: Model<ReturnRequestDocument>,
    private financeService: FinanceService,
    private auditLogService: AuditLogService,
  ) {}

  async getDashboardSummary(queryRange: string = '7D') {
    const range = (queryRange || '7D').toUpperCase();

    // 1. Authoritative Financial Analytics from FinanceService (Source of Truth)
    const financeAnalytics = await this.financeService.getFinancialAnalytics();
    const fSummary = financeAnalytics.summary || {};

    // 2. Date Range Boundaries
    const now = new Date();
    let daysCount = 7;
    if (range === '30D') daysCount = 30;
    else if (range === '90D') daysCount = 90;
    else if (range === 'ALL') daysCount = 365;

    const startDate = new Date();
    startDate.setDate(now.getDate() - (daysCount - 1));
    startDate.setHours(0, 0, 0, 0);

    const prevStartDate = new Date();
    prevStartDate.setDate(startDate.getDate() - daysCount);
    prevStartDate.setHours(0, 0, 0, 0);

    // 3. Fetch Data Efficiently using Indexed Queries and Lean Execution
    const [allOrders, rangeOrders, prevRangeOrders, allProducts, recentAuditLogsRaw, rangeExpenses, prevRangeExpenses] = await Promise.all([
      this.orderModel.find().sort({ createdAt: -1 }).limit(300).lean().exec(),
      this.orderModel.find({ createdAt: { $gte: startDate } }).lean().exec(),
      this.orderModel.find({ createdAt: { $gte: prevStartDate, $lt: startDate } }).lean().exec(),
      this.productModel.find().lean().exec(),
      this.auditLogService.getLogs({ limit: 6 }),
      this.expenseModel.find({ date: { $gte: startDate } }).lean().exec(),
      this.expenseModel.find({ date: { $gte: prevStartDate, $lt: startDate } }).lean().exec(),
    ]);

    // 4. Inventory Calculations from Active Catalog
    let totalProducts = allProducts.length;
    let totalVariants = 0;
    let totalStock = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const p of allProducts) {
      const variants = p.variants || [];
      totalVariants += variants.length;
      for (const v of variants) {
        const qty = v.stockQuantity || 0;
        totalStock += qty;
        const safety = v.safetyStock || 2;
        if (qty === 0) outOfStockCount++;
        else if (qty <= safety) lowStockCount++;
      }
    }

    // Reserved Stock from active pipeline orders (Atomic Inventory calculation)
    let reservedStock = 0;
    const activePipelineStatuses = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
      OrderStatus.PACKED,
    ];

    for (const o of allOrders) {
      if (activePipelineStatuses.includes(o.status as OrderStatus)) {
        for (const item of o.items || []) {
          reservedStock += item.quantity || 1;
        }
      }
    }

    // 5. Action Required Center Counts
    const unconfirmedOrders = allOrders.filter((o) => o.status === OrderStatus.PENDING).length;
    const twelveHoursAgo = new Date(Date.now() - 12 * 3600 * 1000);
    const staleOrders = allOrders.filter(
      (o) =>
        (o.status === OrderStatus.CONFIRMED || o.status === OrderStatus.PROCESSING) &&
        new Date((o as any).createdAt) < twelveHoursAgo,
    ).length;
    const returnRequestsPending = allOrders.filter((o) => o.status === OrderStatus.RETURN_REQUESTED).length;

    // 6. Strict Recognized Sales & Authentic Trend Comparison
    const currentPeriodValidOrders = rangeOrders.filter(
      (o) => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.RETURNED,
    );
    const prevPeriodValidOrders = prevRangeOrders.filter(
      (o) => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.RETURNED,
    );

    const currentRevenue = currentPeriodValidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const prevRevenue = prevPeriodValidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    let currentGp = 0;
    for (const o of currentPeriodValidOrders) {
      let cogs = 0;
      for (const it of o.items || []) {
        cogs += (it.costPrice || 0) * (it.quantity || 1);
      }
      currentGp += (o.subtotal || o.totalAmount || 0) - (o.couponDiscount || 0) - cogs;
    }

    let prevGp = 0;
    for (const o of prevPeriodValidOrders) {
      let cogs = 0;
      for (const it of o.items || []) {
        cogs += (it.costPrice || 0) * (it.quantity || 1);
      }
      prevGp += (o.subtotal || o.totalAmount || 0) - (o.couponDiscount || 0) - cogs;
    }

    const currentExpenses = rangeExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const prevExpenses = prevRangeExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const currentNetProfit = currentGp - currentExpenses;
    const prevNetProfit = prevGp - prevExpenses;

    const calcTrend = (curr: number, prev: number) => {
      if (prev === 0 && curr === 0) return { pct: '0%', isPos: true };
      if (prev === 0) return { pct: curr > 0 ? '+100%' : '0%', isPos: curr >= 0 };
      const change = ((curr - prev) / Math.abs(prev)) * 100;
      const sign = change >= 0 ? '+' : '';
      return { pct: `${sign}${change.toFixed(1)}%`, isPos: change >= 0 };
    };

    const revTrend = calcTrend(currentRevenue, prevRevenue);
    const ordersTrend = calcTrend(rangeOrders.length, prevRangeOrders.length);
    const gpTrend = calcTrend(currentGp, prevGp);
    const npTrend = calcTrend(currentNetProfit, prevNetProfit);
    const codTrend = calcTrend(fSummary.codReceivable || 0, 0);

    // 7. Executive Summary (Reconciled with Finance)
    const executiveSummary = {
      totalRevenue: fSummary.realizedRevenue !== undefined ? fSummary.realizedRevenue : currentRevenue,
      totalOrders: allOrders.length,
      grossProfit: fSummary.grossProfit || 0,
      netProfit: fSummary.netProfit !== undefined ? fSummary.netProfit : 0,
      codReceivable: fSummary.codReceivable || 0,
      lowStockItems: lowStockCount,
      criticalStockItems: outOfStockCount,
      trends: {
        revenue: revTrend.pct,
        revenuePositive: revTrend.isPos,
        orders: ordersTrend.pct,
        ordersPositive: ordersTrend.isPos,
        grossProfit: gpTrend.pct,
        grossProfitPositive: gpTrend.isPos,
        netProfit: npTrend.pct,
        netProfitPositive: npTrend.isPos,
        codReceivable: codTrend.pct,
        codReceivablePositive: codTrend.isPos,
      },
    };

    // 8. Action Required Center Object
    const actionRequired = {
      unconfirmedOrders,
      staleOrders,
      outOfStockSKUs: outOfStockCount,
      lowStockSKUs: lowStockCount,
      returnRequests: returnRequestsPending,
      pendingCodDue: fSummary.codReceivable || 0,
    };

    // 9. Sales Overview (Time Series for Chart)
    const dateMap: Record<string, { date: string; label: string; sales: number; orders: number; grossProfit: number }> = {};
    const chartDays = Math.min(daysCount, 30); // Max 30 points for clean visual density

    for (let i = chartDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      dateMap[iso] = { date: iso, label, sales: 0, orders: 0, grossProfit: 0 };
    }

    for (const order of rangeOrders) {
      if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.RETURNED) continue;
      const orderDate = new Date((order as any).createdAt).toISOString().slice(0, 10);
      if (dateMap[orderDate]) {
        const total = order.totalAmount || 0;
        dateMap[orderDate].sales += total;
        dateMap[orderDate].orders += 1;

        let cogs = 0;
        for (const it of order.items || []) {
          cogs += (it.costPrice || 0) * (it.quantity || 1);
        }
        const gp = (order.subtotal || total) - (order.couponDiscount || 0) - cogs;
        dateMap[orderDate].grossProfit += gp;
      }
    }

    const salesSeries = Object.values(dateMap);
    const maxDailySales = Math.max(...salesSeries.map((s) => s.sales), 1000);

    const salesOverview = {
      timeRange: range,
      daily: salesSeries,
      maxDailySales,
      totalPeriodSales: currentRevenue,
    };

    // 10. Central Normalized Order Status Distribution
    let deliveredCount = 0;
    let inTransitCount = 0;
    let processingCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;

    for (const o of allOrders) {
      const st = o.status as OrderStatus;
      if (st === OrderStatus.DELIVERED) {
        deliveredCount++;
      } else if (st === OrderStatus.SHIPPED || st === OrderStatus.COURIER_BOOKED) {
        inTransitCount++;
      } else if (st === OrderStatus.PROCESSING || st === OrderStatus.PACKED) {
        processingCount++;
      } else if (st === OrderStatus.PENDING || st === OrderStatus.CONFIRMED) {
        pendingCount++;
      } else if (
        st === OrderStatus.CANCELLED ||
        st === OrderStatus.RETURNED ||
        st === OrderStatus.REFUNDED ||
        st === OrderStatus.RETURN_REQUESTED
      ) {
        cancelledCount++;
      }
    }

    const calcPct = (cnt: number) => (allOrders.length > 0 ? Math.round((cnt / allOrders.length) * 100) : 0);

    const orderStatus = {
      delivered: { count: deliveredCount, percentage: calcPct(deliveredCount) },
      inTransit: { count: inTransitCount, percentage: calcPct(inTransitCount) },
      processing: { count: processingCount, percentage: calcPct(processingCount) },
      pending: { count: pendingCount, percentage: calcPct(pendingCount) },
      cancelled: { count: cancelledCount, percentage: calcPct(cancelledCount) },
      totalCount: allOrders.length,
    };

    // 11. Recent Orders (Latest 5)
    const recentOrders = allOrders.slice(0, 5).map((o: any) => {
      let normStatus = 'Pending';
      if (o.status === OrderStatus.DELIVERED) normStatus = 'Delivered';
      else if (o.status === OrderStatus.SHIPPED || o.status === OrderStatus.COURIER_BOOKED) normStatus = 'In Transit';
      else if (o.status === OrderStatus.PROCESSING || o.status === OrderStatus.PACKED) normStatus = 'Processing';
      else if (o.status === OrderStatus.CANCELLED || o.status === OrderStatus.RETURNED) normStatus = 'Cancelled';

      const courierName =
        o.courier?.provider ||
        (o.courier?.consignmentId ? 'Pathao' : o.paymentMethod === 'COD' ? 'Pathao' : 'Manual');

      return {
        _id: o._id?.toString() || '',
        orderId: o.orderId || `AVO-${o._id?.toString().slice(-6)}`,
        customer: o.customerDetails?.name || 'Patron',
        amount: o.totalAmount || 0,
        payment: o.paymentMethod || 'COD',
        courier: courierName,
        status: normStatus,
        rawStatus: o.status,
        date: new Date(o.createdAt).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      };
    });

    // 12. Top Selling Products (Recognized sales policy, top 5)
    const productSalesMap: Record<string, { id: string; name: string; image: string; unitsSold: number; revenue: number }> = {};

    for (const o of allOrders) {
      if (o.status === OrderStatus.CANCELLED || o.status === OrderStatus.RETURNED) continue;
      for (const item of o.items || []) {
        const pId = item.productId?.toString() || item.sku || item.productName;
        if (!productSalesMap[pId]) {
          productSalesMap[pId] = {
            id: pId,
            name: item.productName || 'Avelora Product',
            image: item.productImage || '',
            unitsSold: 0,
            revenue: 0,
          };
        }
        productSalesMap[pId].unitsSold += item.quantity || 1;
        productSalesMap[pId].revenue += (item.unitPrice || 0) * (item.quantity || 1);
      }
    }

    const topProductsList = Object.values(productSalesMap)
      .sort((a, b) => b.unitsSold - a.unitsSold || b.revenue - a.revenue)
      .slice(0, 5)
      .map((p, idx) => ({
        rank: idx + 1,
        ...p,
      }));

    // 13. Courier Management (Latest / Active 5 Shipments)
    const courierOrders = allOrders.filter(
      (o: any) =>
        o.courier?.consignmentId ||
        o.status === OrderStatus.COURIER_BOOKED ||
        o.status === OrderStatus.SHIPPED ||
        o.status === OrderStatus.DELIVERED,
    );

    const courierListSource = courierOrders.length > 0 ? courierOrders : allOrders;
    const courierSummary = courierListSource.slice(0, 5).map((o: any) => {
      let courierStatus = 'Pending';
      if (o.status === OrderStatus.DELIVERED) courierStatus = 'Delivered';
      else if (o.status === OrderStatus.SHIPPED) courierStatus = 'In Transit';
      else if (o.status === OrderStatus.COURIER_BOOKED) courierStatus = 'Picked Up';

      const courierProvider = o.courier?.provider || (o.courier?.consignmentId ? 'Pathao' : 'Pathao');
      const trackingId = o.courier?.consignmentId || '-';

      return {
        _id: o._id?.toString(),
        orderId: o.orderId,
        courier: courierProvider,
        trackingId,
        status: courierStatus,
        trackingUrl: o.courier?.trackingUrl || '',
      };
    });

    // 14. Inventory Summary Object
    const inventorySummary = {
      totalProducts,
      totalVariants,
      totalStock,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
      reservedStock,
    };

    // 15. Financial Overview (Reconciled Statement of P&L)
    const financialOverview = {
      totalRevenue: fSummary.realizedRevenue || 0,
      totalCogs: fSummary.deliveredCostOfGoods || 0,
      grossProfit: fSummary.grossProfit || 0,
      totalExpenses: fSummary.totalOperatingExpenses || 0,
      netProfit: fSummary.netProfit !== undefined ? fSummary.netProfit : 0,
      netProfitMargin: fSummary.netProfitMargin ? Number(fSummary.netProfitMargin) : 0,
    };

    // 16. Recent Audit Logs (Latest 5-6 events)
    const formattedAuditLogs = (recentAuditLogsRaw || []).slice(0, 6).map((log: any) => {
      const ts = log.timestamp ? new Date(log.timestamp) : new Date();
      const dateStr = ts.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const timeStr = ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      let activity = log.action || 'System activity recorded';
      if (log.action === 'ORDER_STATUS_UPDATED') {
        activity = `Order #${log.newData?.orderId || log.entityId?.slice(-6)} status changed to ${log.newData?.status || 'Updated'}`;
      } else if (log.action === 'COURIER_BOOKED') {
        activity = `Courier booked (${log.newData?.provider || 'Pathao'}) for order #${log.newData?.orderId || log.entityId?.slice(-6)}`;
      } else if (log.action === 'PRODUCT_UPDATED') {
        activity = `Product "${log.newData?.title || 'Catalog item'}" updated`;
      } else if (log.action === 'STOCK_ADJUSTED') {
        activity = `Stock adjustment for Product ID #${log.entityId?.slice(-6)}`;
      } else if (log.action === 'USER_CREATED') {
        activity = `New user added: ${log.newData?.name || 'Staff'}`;
      } else if (log.action === 'EXPENSE_RECORDED') {
        activity = `Expense recorded: ${log.newData?.title || 'Operational'}`;
      }

      const role = (log.adminId as any)?.role || 'Admin';
      const actorName = (log.adminId as any)?.name || (role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin');

      return {
        _id: log._id?.toString(),
        date: dateStr,
        time: timeStr,
        activity,
        user: actorName,
        role,
      };
    });

    return {
      executiveSummary,
      actionRequired,
      salesOverview,
      orderStatus,
      recentOrders,
      topProducts: topProductsList,
      courierSummary,
      inventorySummary,
      financialOverview,
      recentAuditLogs: formattedAuditLogs,
    };
  }
}
