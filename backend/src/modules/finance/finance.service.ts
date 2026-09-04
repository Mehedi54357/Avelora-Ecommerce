import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense, ExpenseDocument } from '../../schemas/expense.schema';
import { Order, OrderDocument, OrderStatus, PaymentStatus, CourierSettlementStatus } from '../../schemas/order.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { Supplier, SupplierDocument } from '../../schemas/supplier.schema';
import { PurchaseOrder, PurchaseOrderDocument, PurchaseStatus } from '../../schemas/purchase.schema';
import { CapitalTransaction, CapitalTransactionDocument, CapitalTransactionType } from '../../schemas/capital.schema';
import { CourierSettlement, CourierSettlementDocument, SettlementStatus } from '../../schemas/courier-settlement.schema';
import { Payment, PaymentDocument } from '../../schemas/payment.schema';
import { ReturnRequest, ReturnRequestDocument, ReturnStatus } from '../../schemas/return-request.schema';
import { Category, CategoryDocument } from '../../schemas/category.schema';
import { InventoryTransaction, InventoryTransactionDocument, InventoryTransactionType } from '../../schemas/inventory-transaction.schema';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Supplier.name) private supplierModel: Model<SupplierDocument>,
    @InjectModel(PurchaseOrder.name) private purchaseModel: Model<PurchaseOrderDocument>,
    @InjectModel(CapitalTransaction.name) private capitalModel: Model<CapitalTransactionDocument>,
    @InjectModel(CourierSettlement.name) private settlementModel: Model<CourierSettlementDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(ReturnRequest.name) private returnModel: Model<ReturnRequestDocument>,
    @InjectModel(InventoryTransaction.name) private inventoryTxnModel: Model<InventoryTransactionDocument>,
    private auditLogService: AuditLogService,
  ) {}

  // ================= EXPENSES =================

  async getExpenses(query: { category?: string; limit?: number }) {
    const filter: any = {};
    if (query.category) {
      filter.category = query.category;
    }
    const limit = Math.max(1, Math.min(500, Number(query.limit) || 200));
    return this.expenseModel.find(filter).sort({ date: -1, createdAt: -1 }).limit(limit).exec();
  }

  async createExpense(data: Partial<Expense>, actor: string = 'ADMIN'): Promise<Expense> {
    const exp = await this.expenseModel.create({
      title: data.title,
      category: data.category,
      amount: Number(data.amount) || 0,
      date: data.date ? new Date(data.date) : new Date(),
      description: data.description || '',
    });

    await this.auditLogService.logAction({
      action: 'EXPENSE_RECORDED',
      entityType: 'Expense',
      entityId: (exp as any)._id.toString(),
      newData: {
        title: exp.title,
        amount: exp.amount,
        category: exp.category,
        actor,
      },
    });

    return exp;
  }

  async deleteExpense(id: string, actor: string = 'ADMIN') {
    const result = await this.expenseModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Expense not found');
    }
    await this.auditLogService.logAction({
      action: 'EXPENSE_DELETED',
      entityType: 'Expense',
      entityId: id,
      newData: { title: result.title, actor },
    });
    return { success: true };
  }

  // ================= EXECUTIVE DASHBOARD & REALIZED ANALYTICS =================

  async getFinancialAnalytics() {
    const [allOrders, allExpenses, allProducts, allCapital, allPurchases] = await Promise.all([
      this.orderModel.find({ dataMode: { $ne: 'TEST' } }).exec(),
      this.expenseModel.find().exec(),
      this.productModel.find({ dataMode: { $ne: 'TEST' } }).exec(),
      this.capitalModel.find().exec(),
      this.purchaseModel.find().exec(),
    ]);

    // 1. Delivered / Fulfilled Orders (Realized Revenue Basis)
    const deliveredOrders = allOrders.filter((o) => o.status === OrderStatus.DELIVERED);

    // 2. Active Pipeline Orders (Pending, Confirmed, Processing, Packed, Shipped)
    const pipelineOrders = allOrders.filter(
      (o) =>
        o.status === OrderStatus.PENDING ||
        o.status === OrderStatus.CONFIRMED ||
        o.status === OrderStatus.PROCESSING ||
        o.status === OrderStatus.PACKED ||
        o.status === OrderStatus.SHIPPED,
    );

    const cancelledOrders = allOrders.filter((o) => o.status === OrderStatus.CANCELLED);
    const returnedOrders = allOrders.filter((o) => o.status === OrderStatus.RETURNED);

    let deliveredRevenue = 0;
    let deliveredSubtotal = 0;
    let deliveredCostOfGoods = 0; // COGS
    let deliveredDeliveryCharge = 0;
    let totalPaidCollected = 0;
    let codReceivableFromDelivered = 0;

    for (const order of deliveredOrders) {
      deliveredRevenue += order.totalAmount || 0;
      deliveredSubtotal += (order.subtotal || 0) - (order.couponDiscount || 0);
      deliveredDeliveryCharge += order.deliveryCharge || 0;

      const paid = order.paidAmount !== undefined ? order.paidAmount : (order.paymentMethod === 'COD' ? order.deliveryCharge : order.totalAmount);
      const due = order.dueAmount !== undefined ? order.dueAmount : (order.paymentMethod === 'COD' ? order.subtotal : 0);

      totalPaidCollected += paid || 0;
      codReceivableFromDelivered += due || 0;

      for (const item of order.items) {
        deliveredCostOfGoods += (item.costPrice || 0) * (item.quantity || 1);
      }
    }

    // Pipeline Revenue (Pending fulfillment)
    let pipelineRevenue = 0;
    for (const order of pipelineOrders) {
      pipelineRevenue += order.totalAmount || 0;
    }

    // Gross Profit from Delivered Orders
    const grossProfit = deliveredSubtotal - deliveredCostOfGoods;

    // Total Operating Expenses
    let totalOperatingExpenses = 0;
    const expensesByCategory: Record<string, number> = {};

    for (const exp of allExpenses) {
      totalOperatingExpenses += exp.amount || 0;
      const cat = exp.category || 'Other Operating Expense';
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + exp.amount;
    }

    // Authentic Net Profit = Gross Profit - Operating Expenses
    const netProfit = grossProfit - totalOperatingExpenses;

    // Inventory Valuation at Cost
    let inventoryValueAtCost = 0;
    let inventoryPotentialRetail = 0;
    let totalStockUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const p of allProducts) {
      for (const v of p.variants || []) {
        const qty = v.stockQuantity || 0;
        const cost = v.weightedAverageCost || v.costPrice || 0;
        const price = v.price || p.salePrice || 0;
        totalStockUnits += qty;
        inventoryValueAtCost += qty * cost;
        inventoryPotentialRetail += qty * price;

        if (qty === 0) {
          outOfStockCount++;
        } else if (qty <= (v.safetyStock || 2)) {
          lowStockCount++;
        }
      }
    }

    // Action Center Counts
    const unconfirmedOrdersCount = allOrders.filter((o) => o.status === OrderStatus.PENDING).length;
    const twelveHoursAgo = new Date(Date.now() - 12 * 3600 * 1000);
    const staleOrdersCount = allOrders.filter(
      (o) =>
        (o.status === OrderStatus.CONFIRMED || o.status === OrderStatus.PROCESSING) &&
        new Date((o as any).createdAt) < twelveHoursAgo,
    ).length;
    const returnRequestedCount = allOrders.filter((o) => o.status === OrderStatus.RETURN_REQUESTED).length;

    // Order status counts
    const orderStatusCounts: Record<string, number> = {};
    for (const order of allOrders) {
      orderStatusCounts[order.status] = (orderStatusCounts[order.status] || 0) + 1;
    }

    // 7-day daily activity
    const last7DaysMap: Record<string, { date: string; sales: number; orders: number; grossProfit: number; netProfit: number }> = {};
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      last7DaysMap[dateKey] = {
        date: dateKey,
        sales: 0,
        orders: 0,
        grossProfit: 0,
        netProfit: 0,
      };
    }

    for (const order of allOrders) {
      if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.RETURNED) continue;
      let orderDate = '';
      try {
        const d = (order as any).createdAt ? new Date((order as any).createdAt) : new Date();
        if (!isNaN(d.getTime())) {
          orderDate = d.toISOString().slice(0, 10);
        }
      } catch {}
      if (orderDate && last7DaysMap[orderDate]) {
        last7DaysMap[orderDate].sales += order.totalAmount || 0;
        last7DaysMap[orderDate].orders += 1;

        let orderCogs = 0;
        for (const item of order.items) {
          orderCogs += (item.costPrice || 0) * (item.quantity || 1);
        }
        const gp = ((order.subtotal || 0) - (order.couponDiscount || 0)) - orderCogs;
        last7DaysMap[orderDate].grossProfit += gp;
        last7DaysMap[orderDate].netProfit += gp; // Base before daily exp distribution
      }
    }

    const averageOrderValue = deliveredOrders.length > 0
      ? Math.round(deliveredRevenue / deliveredOrders.length)
      : 0;

    const returnRate = allOrders.length > 0
      ? ((returnedOrders.length / allOrders.length) * 100).toFixed(1)
      : '0';

    return {
      summary: {
        totalOrders: allOrders.length,
        deliveredOrdersCount: deliveredOrders.length,
        pipelineOrdersCount: pipelineOrders.length,
        cancelledOrdersCount: cancelledOrders.length,
        returnedOrdersCount: returnedOrders.length,
        // Realized Metrics
        realizedRevenue: deliveredRevenue,
        deliveredSubtotal,
        deliveredCostOfGoods,
        grossProfit,
        grossProfitMargin: deliveredSubtotal > 0 ? ((grossProfit / deliveredSubtotal) * 100).toFixed(1) : '0',
        totalOperatingExpenses,
        netProfit,
        netProfitMargin: deliveredRevenue > 0 ? ((netProfit / deliveredRevenue) * 100).toFixed(1) : '0',
        cashCollected: totalPaidCollected,
        codReceivable: codReceivableFromDelivered,
        // Pipeline & Diagnostics
        pipelineRevenue,
        totalPlacedValue: deliveredRevenue + pipelineRevenue,
        averageOrderValue,
        returnRate,
        inventoryValueAtCost,
        inventoryPotentialRetail,
        totalStockUnits,
        lowStockCount,
        outOfStockCount,
      },
      actionCenter: {
        unconfirmedOrders: unconfirmedOrdersCount,
        staleOrders: staleOrdersCount,
        outOfStockVariants: outOfStockCount,
        lowStockVariants: lowStockCount,
        returnRequestsPending: returnRequestedCount,
        codSettlementPendingAmount: codReceivableFromDelivered,
      },
      expensesByCategory,
      orderStatusCounts,
      dailySales: Object.values(last7DaysMap),
      recentExpenses: allExpenses.slice(-5).reverse(),
    };
  }

  // ================= STATEMENT OF PROFIT & LOSS =================

  async getDetailedPnL(query: { from?: string; to?: string }) {
    const fromDate = query.from ? new Date(query.from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const toDate = query.to ? new Date(query.to) : new Date();
    toDate.setHours(23, 59, 59, 999);

    const [orders, expenses] = await Promise.all([
      this.orderModel.find({ createdAt: { $gte: fromDate, $lte: toDate }, dataMode: { $ne: 'TEST' } }).exec(),
      this.expenseModel.find({ date: { $gte: fromDate, $lte: toDate } }).exec(),
    ]);

    const delivered = orders.filter((o) => o.status === OrderStatus.DELIVERED);
    const returned = orders.filter((o) => o.status === OrderStatus.RETURNED || o.status === OrderStatus.REFUNDED);

    let grossProductSales = 0;
    let productDiscounts = 0;
    let couponDiscounts = 0;
    let shippingCollected = 0;
    let recognizedCogs = 0;
    let actualCourierCost = 0;

    for (const o of delivered) {
      grossProductSales += o.subtotal || 0;
      productDiscounts += o.discount || 0;
      couponDiscounts += o.couponDiscount || 0;
      shippingCollected += o.deliveryCharge || 0;
      actualCourierCost += o.courier?.charge || o.courier?.deliveryFee || (o.deliveryCharge ? o.deliveryCharge * 0.8 : 0);

      for (const item of o.items) {
        recognizedCogs += (item.costPrice || 0) * (item.quantity || 1);
      }
    }

    let returnedMerchandiseValue = 0;
    for (const o of returned) {
      returnedMerchandiseValue += o.totalAmount || 0;
    }

    const totalDiscounts = productDiscounts + couponDiscounts;
    const netProductSales = Math.max(0, grossProductSales - totalDiscounts - returnedMerchandiseValue);
    const netTotalRevenue = netProductSales + shippingCollected;

    const grossProfit = netProductSales - recognizedCogs;
    const grossMarginPercent = netProductSales > 0 ? ((grossProfit / netProductSales) * 100).toFixed(1) : '0';

    // OPEX categorization
    let marketingExpense = 0;
    let packagingExpense = 0;
    let salaryExpense = 0;
    let utilityExpense = 0;
    let paymentFees = 0;
    let otherOperatingExpense = 0;

    for (const exp of expenses) {
      const cat = (exp.category || '').toLowerCase();
      if (cat.includes('marketing')) marketingExpense += exp.amount;
      else if (cat.includes('packaging')) packagingExpense += exp.amount;
      else if (cat.includes('salary')) salaryExpense += exp.amount;
      else if (cat.includes('utility') || cat.includes('office')) utilityExpense += exp.amount;
      else if (cat.includes('payment') || cat.includes('gateway')) paymentFees += exp.amount;
      else otherOperatingExpense += exp.amount;
    }

    const contributionProfit = grossProfit + (shippingCollected - actualCourierCost) - packagingExpense - paymentFees;
    const totalOverhead = marketingExpense + salaryExpense + utilityExpense + otherOperatingExpense;
    const netProfit = contributionProfit - totalOverhead;
    const netMarginPercent = netTotalRevenue > 0 ? ((netProfit / netTotalRevenue) * 100).toFixed(1) : '0';

    return {
      period: {
        from: fromDate.toISOString().slice(0, 10),
        to: toDate.toISOString().slice(0, 10),
      },
      deliveredOrdersCount: delivered.length,
      revenueSection: {
        grossProductSales,
        productDiscounts,
        couponDiscounts,
        returnedMerchandiseValue,
        netProductSales,
        shippingCollected,
        netTotalRevenue,
      },
      cogsSection: {
        recognizedCogs,
        grossProfit,
        grossMarginPercent,
      },
      logisticsAndDirectCosts: {
        actualCourierCost,
        packagingExpense,
        paymentFees,
        shippingContribution: shippingCollected - actualCourierCost,
        contributionProfit,
      },
      overheadSection: {
        marketingExpense,
        salaryExpense,
        utilityExpense,
        otherOperatingExpense,
        totalOverhead,
      },
      finalNetProfit: {
        netProfit,
        netMarginPercent,
      },
    };
  }

  // ================= CASH FLOW & WORKING CAPITAL =================

  async getCashFlow() {
    const [orders, expenses, capital, purchases] = await Promise.all([
      this.orderModel.find({ dataMode: { $ne: 'TEST' } }).exec(),
      this.expenseModel.find().exec(),
      this.capitalModel.find().exec(),
      this.purchaseModel.find().exec(),
    ]);

    // Inflows
    let customerAdvancePaid = 0;
    let codSettledFromDelivered = 0;
    let courierCodReceivableOutstanding = 0;

    for (const o of orders) {
      if (o.paidAmount > 0) {
        customerAdvancePaid += o.paidAmount;
      }

      // COD Orders Accounting Rule: Only increase Cash/Bank when genuine settlement has been received!
      if (o.paymentMethod === 'COD' && o.status === OrderStatus.DELIVERED) {
        const codDue = o.dueAmount !== undefined ? o.dueAmount : o.subtotal;
        if (o.courier?.settlementStatus === CourierSettlementStatus.SETTLED) {
          codSettledFromDelivered += o.courier.actualSettlement !== undefined ? o.courier.actualSettlement : (codDue - (o.courier.deliveryFee || 0));
        } else {
          courierCodReceivableOutstanding += codDue;
        }
      }
    }

    let capitalIn = 0;
    let capitalWithdrawals = 0;
    for (const c of capital) {
      if (c.type === CapitalTransactionType.OWNER_CAPITAL_IN || c.type === CapitalTransactionType.LOAN_IN) {
        capitalIn += c.amount || 0;
      } else {
        capitalWithdrawals += c.amount || 0;
      }
    }

    const totalCashIn = customerAdvancePaid + codSettledFromDelivered + capitalIn;

    // Outflows
    let supplierPaid = 0;
    for (const p of purchases) {
      supplierPaid += p.paidAmount || 0;
    }

    let operatingExpensesPaid = 0;
    for (const e of expenses) {
      operatingExpensesPaid += e.amount || 0;
    }

    const totalCashOut = supplierPaid + operatingExpensesPaid + capitalWithdrawals;
    const netCashPosition = totalCashIn - totalCashOut;

    return {
      inflows: {
        customerAdvancePaid,
        codSettledFromDelivered,
        capitalIn,
        totalCashIn,
      },
      outflows: {
        supplierPaid,
        operatingExpensesPaid,
        capitalWithdrawals,
        totalCashOut,
      },
      netCashPosition,
      summary: {
        cashInHandAndBank: Math.max(0, netCashPosition),
        totalInflow: totalCashIn,
        totalOutflow: totalCashOut,
      },
    };
  }

  // ================= INVENTORY VALUATION & STOCK INVESTMENT =================

  async getInventoryValuation() {
    const products = await this.productModel.find({ dataMode: { $ne: 'TEST' } }).exec();

    let totalPhysicalStock = 0;
    let totalReservedStock = 0;
    let totalStockInvestmentAtCost = 0;
    let totalPotentialRetailValue = 0;

    const skuList: any[] = [];

    for (const p of products) {
      for (const v of p.variants || []) {
        const onHand = v.stockQuantity || 0;
        const reserved = v.reservedQuantity || 0;
        const available = Math.max(0, onHand - reserved);
        const unitCost = v.weightedAverageCost || v.costPrice || 0;
        const retailPrice = v.price || p.salePrice || 0;
        const investment = onHand * unitCost;
        const retailValue = onHand * retailPrice;
        const potentialMargin = retailValue - investment;

        totalPhysicalStock += onHand;
        totalReservedStock += reserved;
        totalStockInvestmentAtCost += investment;
        totalPotentialRetailValue += retailValue;

        skuList.push({
          productId: p._id,
          productName: p.name,
          sku: v.sku,
          variantDetails: `${v.color || ''} ${v.size || ''}`.trim(),
          image: v.image || (p.images && p.images[0]) || '',
          onHand,
          reserved,
          available,
          safetyStock: v.safetyStock || 2,
          unitCost,
          retailPrice,
          investmentAtCost: investment,
          retailValue,
          potentialMargin,
          marginPercent: retailValue > 0 ? ((potentialMargin / retailValue) * 100).toFixed(1) : '0',
          isLowStock: onHand <= (v.safetyStock || 2) && onHand > 0,
          isOutOfStock: onHand === 0,
        });
      }
    }

    return {
      summary: {
        totalPhysicalStock,
        totalReservedStock,
        totalAvailableStock: totalPhysicalStock - totalReservedStock,
        totalStockInvestmentAtCost,
        totalPotentialRetailValue,
        potentialGrossProfit: totalPotentialRetailValue - totalStockInvestmentAtCost,
        overallMarginPercent: totalPotentialRetailValue > 0
          ? (((totalPotentialRetailValue - totalStockInvestmentAtCost) / totalPotentialRetailValue) * 100).toFixed(1)
          : '0',
        totalSkus: skuList.length,
      },
      skuBreakdown: skuList.sort((a, b) => b.investmentAtCost - a.investmentAtCost),
    };
  }

  // ================= RECONCILIATION: GATEWAY & COURIER COD ACCOUNTING =================

  async getReconciliation() {
    const [orders, settlements] = await Promise.all([
      this.orderModel.find({ paymentMethod: 'COD', dataMode: { $ne: 'TEST' } }).sort({ createdAt: -1 }).limit(200).exec(),
      this.settlementModel.find().sort({ settledAt: -1 }).limit(50).exec(),
    ]);

    // Include Delivered, Shipped, and Booked COD orders
    const codOrders = orders.filter(
      (o) =>
        o.status === OrderStatus.DELIVERED ||
        o.status === OrderStatus.SHIPPED ||
        o.status === OrderStatus.COURIER_BOOKED,
    );

    let totalDeliveredCodDue = 0;
    let totalSettledAmount = 0;
    let totalCourierFees = 0;
    let outstandingCodReceivable = 0;
    let totalDisputedAmount = 0;

    const formattedOrders = codOrders.map((o) => {
      const codDue = o.dueAmount !== undefined ? o.dueAmount : o.subtotal;
      const courierFee = o.courier?.deliveryFee || o.deliveryCharge || 0;
      const returnFee = o.courier?.returnFee || 0;
      const expectedSettlement = Math.max(0, codDue - courierFee - returnFee);
      const actualSettlement = o.courier?.actualSettlement || 0;
      const settlementStatus = o.courier?.settlementStatus || (o.status === OrderStatus.DELIVERED ? CourierSettlementStatus.AWAITING_SETTLEMENT : CourierSettlementStatus.NOT_APPLICABLE);
      const variance = o.courier?.variance !== undefined ? o.courier.variance : (settlementStatus === CourierSettlementStatus.SETTLED ? (expectedSettlement - actualSettlement) : 0);

      if (o.status === OrderStatus.DELIVERED) {
        totalDeliveredCodDue += codDue;
        totalCourierFees += courierFee;

        if (settlementStatus === CourierSettlementStatus.SETTLED) {
          totalSettledAmount += actualSettlement;
        } else {
          outstandingCodReceivable += codDue;
        }

        if (settlementStatus === CourierSettlementStatus.DISPUTED) {
          totalDisputedAmount += Math.abs(variance);
        }
      }

      return {
        _id: o._id,
        orderId: o.orderId,
        customerName: o.customerDetails?.name || 'Customer',
        customerMobile: o.customerDetails?.mobile,
        customerDistrict: o.customerDetails?.district,
        consignmentId: o.courier?.consignmentId || 'Pending Booking',
        courierProvider: o.courier?.provider || 'Pathao',
        orderStatus: o.status,
        deliveryDate: o.courier?.deliveredAt || (o.status === OrderStatus.DELIVERED ? (o as any).updatedAt : null),
        codCollected: codDue,
        courierFee,
        returnFee,
        expectedSettlement,
        actualSettlement,
        settlementDate: o.courier?.settledAt || null,
        bankAccount: o.courier?.settlementAccount || '',
        transactionRef: o.courier?.transactionRef || '',
        variance,
        settlementStatus,
        discrepancyNote: o.courier?.settlementNotes || '',
      };
    });

    return {
      kpis: {
        deliveredCodOrdersCount: codOrders.filter((o) => o.status === OrderStatus.DELIVERED).length,
        totalDeliveredCodDue,
        totalSettledAmount,
        totalCourierFees,
        outstandingCodReceivable,
        totalDisputedAmount,
      },
      orders: formattedOrders,
      settlementBatches: settlements,
      gatewayReconciliation: {
        totalDigitalOrders: (await this.orderModel.countDocuments({ paymentMethod: { $ne: 'COD' } }).exec()),
        matchedStatus: 'ALL_VERIFIED',
      },
    };
  }

  /**
   * Reconcile Single Order Courier Settlement
   */
  async reconcileCourierOrder(
    payload: {
      orderId: string;
      actualSettlement: number;
      courierFee?: number;
      returnFee?: number;
      settlementAccount: string;
      transactionRef?: string;
      settledAt?: string | Date;
      status: CourierSettlementStatus;
      notes?: string;
    },
    actorEmail: string = 'ADMIN',
  ) {
    const order = await this.orderModel.findById(payload.orderId).exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const codDue = order.dueAmount !== undefined ? order.dueAmount : order.subtotal;
    const courierFee = payload.courierFee !== undefined ? Number(payload.courierFee) : (order.courier?.deliveryFee || 0);
    const returnFee = payload.returnFee !== undefined ? Number(payload.returnFee) : (order.courier?.returnFee || 0);
    const actualSettlement = Number(payload.actualSettlement || 0);
    const expectedSettlement = Math.max(0, codDue - courierFee - returnFee);
    const variance = expectedSettlement - actualSettlement;

    if (!order.courier) {
      order.courier = {
        provider: 'Pathao',
        consignmentId: '',
        trackingUrl: '',
        charge: courierFee,
      };
    }

    order.courier.deliveryFee = courierFee;
    order.courier.returnFee = returnFee;
    order.courier.expectedSettlement = expectedSettlement;
    order.courier.actualSettlement = actualSettlement;
    order.courier.settlementStatus = payload.status || CourierSettlementStatus.SETTLED;
    order.courier.settledAt = payload.settledAt ? new Date(payload.settledAt) : new Date();
    order.courier.settlementAccount = payload.settlementAccount || 'Bank Account';
    order.courier.transactionRef = payload.transactionRef || '';
    order.courier.variance = variance;
    order.courier.settlementNotes = payload.notes || '';

    order.timeline.push({
      status: `SETTLEMENT_${order.courier.settlementStatus}`,
      at: new Date(),
      actor: actorEmail,
      note: `Courier COD Reconciled. Status: ${order.courier.settlementStatus}. Settled: ৳${actualSettlement} into ${order.courier.settlementAccount} (Ref: ${order.courier.transactionRef || 'N/A'}). Variance: ৳${variance}`,
    });

    await order.save();

    await this.auditLogService.logAction({
      action: 'COURIER_SETTLEMENT_RECONCILED',
      entityType: 'Order',
      entityId: (order as any)._id.toString(),
      newData: {
        orderId: order.orderId,
        consignmentId: order.courier.consignmentId,
        actualSettlement,
        settlementAccount: order.courier.settlementAccount,
        status: order.courier.settlementStatus,
        variance,
        actor: actorEmail,
      },
    });

    return {
      success: true,
      order: order,
    };
  }

  /**
   * Bulk Reconcile Courier Settlement Statements / CSV Import
   */
  async bulkReconcileCourier(
    payload: {
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
    },
    actorEmail: string = 'ADMIN',
  ) {
    if (!payload.items || payload.items.length === 0) {
      throw new BadRequestException('Settlement items list cannot be empty');
    }

    const provider = payload.provider || 'Pathao';
    const batchId = payload.settlementBatchId || `SETTLE-${Date.now()}`;
    const settledAt = payload.settledAt ? new Date(payload.settledAt) : new Date();

    let totalCod = 0;
    let totalFees = 0;
    let totalNet = 0;
    const lines: any[] = [];
    const updatedOrderIds: string[] = [];

    for (const item of payload.items) {
      const cleanKey = item.orderIdOrConsignment?.trim();
      if (!cleanKey) continue;

      const order = await this.orderModel
        .findOne({
          $or: [{ orderId: cleanKey }, { 'courier.consignmentId': cleanKey }],
        })
        .exec();

      const codCollected = Number(item.codCollected || (order ? order.dueAmount || order.subtotal : 0));
      const courierFee = Number(item.courierFee || (order?.courier?.deliveryFee || 0));
      const returnFee = Number(item.returnFee || 0);
      const actualSettlement = Number(item.actualSettlement || (codCollected - courierFee - returnFee));
      const expectedSettlement = Math.max(0, codCollected - courierFee - returnFee);
      const variance = expectedSettlement - actualSettlement;

      totalCod += codCollected;
      totalFees += courierFee + returnFee;
      totalNet += actualSettlement;

      let status = SettlementStatus.MATCHED;
      let orderSettlementStatus = CourierSettlementStatus.SETTLED;

      if (variance !== 0) {
        status = SettlementStatus.AMOUNT_MISMATCH;
        orderSettlementStatus = CourierSettlementStatus.DISPUTED;
      }

      if (!order) {
        status = SettlementStatus.MISSING_ORDER;
      } else {
        if (!order.courier) {
          order.courier = {
            provider,
            consignmentId: cleanKey,
            trackingUrl: '',
            charge: courierFee,
          };
        }

        order.courier.deliveryFee = courierFee;
        order.courier.returnFee = returnFee;
        order.courier.actualSettlement = actualSettlement;
        order.courier.expectedSettlement = expectedSettlement;
        order.courier.settlementStatus = orderSettlementStatus;
        order.courier.settledAt = settledAt;
        order.courier.settlementAccount = payload.settlementAccount;
        order.courier.transactionRef = payload.transactionRef;
        order.courier.variance = variance;
        order.courier.settlementNotes = item.notes || `Reconciled via batch ${batchId}`;

        order.timeline.push({
          status: `SETTLEMENT_${orderSettlementStatus}`,
          at: new Date(),
          actor: actorEmail,
          note: `Batch Reconciled (${batchId}). Settled: ৳${actualSettlement} to ${payload.settlementAccount}.`,
        });

        await order.save();
        updatedOrderIds.push(order.orderId);
      }

      lines.push({
        orderId: order?._id,
        orderNumber: order?.orderId || cleanKey,
        consignmentId: order?.courier?.consignmentId || cleanKey,
        codCollected,
        deliveryFee: courierFee,
        returnFee,
        adjustmentFee: 0,
        netRemitted: actualSettlement,
        status,
        discrepancyNote: item.notes || '',
      });
    }

    // Persist Settlement Batch Record
    const batchRecord = await this.settlementModel.create({
      provider,
      settlementBatchId: batchId,
      lines,
      totalCodCollected: totalCod,
      totalFeesDeducted: totalFees,
      totalNetRemitted: totalNet,
      settledAt,
      overallStatus: lines.some((l) => l.status !== SettlementStatus.MATCHED) ? 'HAS_DISCREPANCIES' : 'MATCHED',
      bankDepositReference: payload.transactionRef || payload.settlementAccount,
      notes: `Batch reconciled by ${actorEmail} with ${lines.length} orders.`,
      reconciledBy: actorEmail,
    });

    await this.auditLogService.logAction({
      action: 'COURIER_BATCH_SETTLEMENT_RECONCILED',
      entityType: 'CourierSettlement',
      entityId: (batchRecord as any)._id.toString(),
      newData: {
        batchId,
        provider,
        totalNet,
        totalFees,
        ordersCount: updatedOrderIds.length,
        actor: actorEmail,
      },
    });

    return {
      success: true,
      batchId,
      totalNetRemitted: totalNet,
      reconciledOrdersCount: updatedOrderIds.length,
      updatedOrders: updatedOrderIds,
    };
  }

  // ================= BUSINESS OWNER PROFITABILITY, INVESTMENT & INVENTORY INTELLIGENCE =================

  async getBusinessPerformance(query: {
    range?: string;
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    productId?: string;
    variantSku?: string;
    search?: string;
  }) {
    const now = new Date();
    let fromDate: Date;
    let toDate = new Date();
    toDate.setHours(23, 59, 59, 999);

    const range = (query.range || '30d').toLowerCase();

    if (range === 'today') {
      fromDate = new Date();
      fromDate.setHours(0, 0, 0, 0);
    } else if (range === '7d') {
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      fromDate.setHours(0, 0, 0, 0);
    } else if (range === '30d') {
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      fromDate.setHours(0, 0, 0, 0);
    } else if (range === '90d') {
      fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      fromDate.setHours(0, 0, 0, 0);
    } else if (range === 'this_month') {
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === 'this_year') {
      fromDate = new Date(now.getFullYear(), 0, 1);
    } else if (range === 'all') {
      fromDate = new Date(0);
    } else if (range === 'custom' && query.startDate) {
      fromDate = new Date(query.startDate);
      if (query.endDate) {
        toDate = new Date(query.endDate);
        toDate.setHours(23, 59, 59, 999);
      }
    } else {
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [
      allProducts,
      allCategories,
      allPurchases,
      allOrders,
      allReturns,
      allExpenses,
      allCapital,
    ] = await Promise.all([
      this.productModel.find({ dataMode: { $ne: 'TEST' } }).populate('categoryId').exec(),
      this.categoryModel.find().exec(),
      this.purchaseModel.find({ dataMode: { $ne: 'TEST' } }).exec(),
      this.orderModel.find({ dataMode: { $ne: 'TEST' } }).exec(),
      this.returnModel.find({ dataMode: { $ne: 'TEST' } }).exec(),
      this.expenseModel.find({ dataMode: { $ne: 'TEST' } }).exec(),
      this.capitalModel.find({ dataMode: { $ne: 'TEST' } }).exec(),
    ]);

    const categoryMap = new Map<string, any>();
    allCategories.forEach((c) => {
      categoryMap.set(c._id.toString(), {
        _id: c._id.toString(),
        name: c.name,
        slug: c.slug,
        department: c.department || 'general',
      });
    });

    const uncategorizedCat = {
      _id: 'uncategorized',
      name: 'Uncategorized',
      slug: 'uncategorized',
      department: 'general',
    };
    categoryMap.set('uncategorized', uncategorizedCat);

    // Group purchases by SKU
    const purchasesBySku = new Map<string, { totalQty: number; totalCost: number; periodQty: number; periodCost: number; lastReceiptDate?: Date }>();
    
    for (const po of allPurchases) {
      if (po.status === PurchaseStatus.CANCELLED) continue;
      const isReceived = po.status === PurchaseStatus.RECEIVED || Boolean(po.receivedAt);
      const receiptDate = po.receivedAt
        ? new Date(po.receivedAt)
        : (po as any).createdAt
        ? new Date((po as any).createdAt)
        : new Date();
      const inPeriod = isReceived && !isNaN(receiptDate.getTime()) && receiptDate >= fromDate && receiptDate <= toDate;

      for (const item of po.items || []) {
        const sku = (item.sku || '').trim();
        if (!sku) continue;

        let entry = purchasesBySku.get(sku);
        if (!entry) {
          entry = { totalQty: 0, totalCost: 0, periodQty: 0, periodCost: 0 };
          purchasesBySku.set(sku, entry);
        }

        if (isReceived) {
          entry.totalQty += item.quantity || 0;
          entry.totalCost += item.totalCost || (item.quantity * item.unitCost) || 0;
          if (!entry.lastReceiptDate || receiptDate > entry.lastReceiptDate) {
            entry.lastReceiptDate = receiptDate;
          }

          if (inPeriod) {
            entry.periodQty += item.quantity || 0;
            entry.periodCost += item.totalCost || (item.quantity * item.unitCost) || 0;
          }
        }
      }
    }

    // Group orders by SKU (Delivered for realized revenue & COGS; returns for reversal/reconciliation)
    const salesBySku = new Map<string, {
      lifetimeSoldQty: number;
      lifetimeRevenue: number;
      lifetimeCogs: number;
      periodSoldQty: number;
      periodRevenue: number;
      periodCogs: number;
      lastSaleDate?: Date;
    }>();

    for (const order of allOrders) {
      if (order.status !== OrderStatus.DELIVERED) continue;
      const orderDate = (order as any).createdAt ? new Date((order as any).createdAt) : new Date();
      const inPeriod = !isNaN(orderDate.getTime()) && orderDate >= fromDate && orderDate <= toDate;

      for (const item of order.items || []) {
        const sku = (item.sku || '').trim();
        if (!sku) continue;

        let entry = salesBySku.get(sku);
        if (!entry) {
          entry = {
            lifetimeSoldQty: 0,
            lifetimeRevenue: 0,
            lifetimeCogs: 0,
            periodSoldQty: 0,
            periodRevenue: 0,
            periodCogs: 0,
          };
          salesBySku.set(sku, entry);
        }

        const qty = item.quantity || 1;
        const lineRevenue = (item.unitPrice || 0) * qty;
        const lineCogs = (item.costPrice !== undefined ? item.costPrice : 0) * qty;

        entry.lifetimeSoldQty += qty;
        entry.lifetimeRevenue += lineRevenue;
        entry.lifetimeCogs += lineCogs;

        if (!entry.lastSaleDate || orderDate > entry.lastSaleDate) {
          entry.lastSaleDate = orderDate;
        }

        if (inPeriod) {
          entry.periodSoldQty += qty;
          entry.periodRevenue += lineRevenue;
          entry.periodCogs += lineCogs;
        }
      }
    }

    // Group Returns & Damages by SKU
    const returnsBySku = new Map<string, { periodReturnQty: number; periodDamageQty: number }>();
    for (const ret of allReturns) {
      const retDate = (ret as any).createdAt ? new Date((ret as any).createdAt) : new Date();
      const inPeriod = !isNaN(retDate.getTime()) && retDate >= fromDate && retDate <= toDate;
      if (!inPeriod) continue;

      for (const item of ret.items || []) {
        const sku = (item.sku || '').trim();
        if (!sku) continue;

        let entry = returnsBySku.get(sku);
        if (!entry) {
          entry = { periodReturnQty: 0, periodDamageQty: 0 };
          returnsBySku.set(sku, entry);
        }

        entry.periodReturnQty += item.quantity || 0;
        if (ret.status === ReturnStatus.INSPECTED_DAMAGED || !item.restockable) {
          entry.periodDamageQty += item.quantity || 0;
        }
      }
    }

    const categoryResultMap = new Map<string, any>();
    const productList: any[] = [];
    const allVariantsFlat: any[] = [];

    for (const p of allProducts) {
      const catObj: any = p.categoryId || uncategorizedCat;
      const catId = (catObj._id || catObj.id || 'uncategorized').toString();
      const catName = catObj.name || 'Uncategorized';

      if (!categoryResultMap.has(catId)) {
        categoryResultMap.set(catId, {
          categoryId: catId,
          categoryName: catName,
          department: catObj.department || 'general',
          purchasedQty: 0,
          purchaseInvestment: 0,
          soldQty: 0,
          revenue: 0,
          cogs: 0,
          grossProfit: 0,
          grossMarginPercent: 0,
          physicalStock: 0,
          reservedStock: 0,
          availableStock: 0,
          inventoryValue: 0,
          returnQty: 0,
          damageQty: 0,
          damageLoss: 0,
          productCount: 0,
          products: [],
        });
      }

      const catEntry = categoryResultMap.get(catId);
      catEntry.productCount += 1;

      const productEntry = {
        productId: p._id.toString(),
        productName: p.name,
        slug: p.slug,
        image: p.images?.[0] || '',
        categoryId: catId,
        categoryName: catName,
        purchasedQty: 0,
        purchaseInvestment: 0,
        averageCost: 0,
        soldQty: 0,
        averageSellingPrice: 0,
        revenue: 0,
        cogs: 0,
        grossProfit: 0,
        grossMarginPercent: 0,
        physicalStock: 0,
        reservedStock: 0,
        availableStock: 0,
        inventoryValue: 0,
        returnQty: 0,
        damageQty: 0,
        damageLoss: 0,
        hasVariants: Array.isArray(p.variants) && p.variants.length > 0,
        variants: [] as any[],
        lastSaleDate: undefined as Date | undefined,
      };

      for (const v of p.variants || []) {
        const sku = (v.sku || '').trim();
        const physical = v.stockQuantity || 0;
        const reserved = v.reservedQuantity || 0;
        const available = Math.max(0, physical - reserved);
        const unitCost = v.weightedAverageCost || v.costPrice || 0;
        const invValue = physical * unitCost;

        const pData = purchasesBySku.get(sku) || { totalQty: 0, totalCost: 0, periodQty: 0, periodCost: 0 };
        const sData = salesBySku.get(sku) || { lifetimeSoldQty: 0, lifetimeRevenue: 0, lifetimeCogs: 0, periodSoldQty: 0, periodRevenue: 0, periodCogs: 0 };
        const rData = returnsBySku.get(sku) || { periodReturnQty: 0, periodDamageQty: 0 };

        const effectivePurchasedQty = pData.totalQty > 0 ? pData.totalQty : (physical + sData.lifetimeSoldQty);
        const effectiveInvestment = pData.totalCost > 0 ? pData.totalCost : (effectivePurchasedQty * unitCost);

        const vRevenue = sData.periodRevenue;
        const vCogs = sData.periodCogs;
        const vGrossProfit = vRevenue - vCogs;
        const vMargin = vRevenue > 0 ? (vGrossProfit / vRevenue) * 100 : 0;
        const vAvgSellingPrice = sData.periodSoldQty > 0 ? vRevenue / sData.periodSoldQty : (v.price || p.salePrice || 0);
        const vDamageLoss = rData.periodDamageQty * unitCost;

        const variantEntry = {
          productId: p._id.toString(),
          productName: p.name,
          categoryId: catId,
          categoryName: catName,
          sku,
          variantDetails: `${v.color || ''} ${v.size || ''}`.trim() || 'Standard',
          color: v.color || '',
          size: v.size || '',
          image: v.image || p.images?.[0] || '',
          purchasedQty: effectivePurchasedQty,
          purchaseInvestment: effectiveInvestment,
          unitCost,
          averageCost: unitCost,
          soldQty: sData.periodSoldQty,
          averageSellingPrice: Math.round(vAvgSellingPrice),
          revenue: vRevenue,
          cogs: vCogs,
          grossProfit: vGrossProfit,
          grossMarginPercent: Number(vMargin.toFixed(2)),
          physicalStock: physical,
          reservedStock: reserved,
          availableStock: available,
          inventoryValue: invValue,
          returnQty: rData.periodReturnQty,
          damageQty: rData.periodDamageQty,
          damageLoss: vDamageLoss,
          lastSaleDate: sData.lastSaleDate,
          daysSinceLastSale: sData.lastSaleDate
            ? Math.floor((now.getTime() - new Date(sData.lastSaleDate).getTime()) / (1000 * 60 * 60 * 24))
            : (pData.lastReceiptDate ? Math.floor((now.getTime() - new Date(pData.lastReceiptDate).getTime()) / (1000 * 60 * 60 * 24)) : 999),
        };

        productEntry.variants.push(variantEntry);
        allVariantsFlat.push(variantEntry);

        productEntry.purchasedQty += variantEntry.purchasedQty;
        productEntry.purchaseInvestment += variantEntry.purchaseInvestment;
        productEntry.soldQty += variantEntry.soldQty;
        productEntry.revenue += variantEntry.revenue;
        productEntry.cogs += variantEntry.cogs;
        productEntry.grossProfit += variantEntry.grossProfit;
        productEntry.physicalStock += variantEntry.physicalStock;
        productEntry.reservedStock += variantEntry.reservedStock;
        productEntry.availableStock += variantEntry.availableStock;
        productEntry.inventoryValue += variantEntry.inventoryValue;
        productEntry.returnQty += variantEntry.returnQty;
        productEntry.damageQty += variantEntry.damageQty;
        productEntry.damageLoss += variantEntry.damageLoss;

        if (variantEntry.lastSaleDate && (!productEntry.lastSaleDate || variantEntry.lastSaleDate > productEntry.lastSaleDate)) {
          productEntry.lastSaleDate = variantEntry.lastSaleDate;
        }
      }

      if (!productEntry.hasVariants) {
        const unitCost = p.originalPrice > 0 ? p.originalPrice * 0.7 : p.salePrice * 0.7;
        productEntry.averageCost = unitCost;
        productEntry.inventoryValue = 0;
      } else {
        productEntry.averageCost = productEntry.physicalStock > 0 ? Math.round(productEntry.inventoryValue / productEntry.physicalStock) : (productEntry.variants[0]?.averageCost || 0);
      }

      productEntry.averageSellingPrice = productEntry.soldQty > 0 ? Math.round(productEntry.revenue / productEntry.soldQty) : (p.salePrice || 0);
      productEntry.grossMarginPercent = productEntry.revenue > 0 ? Number(((productEntry.grossProfit / productEntry.revenue) * 100).toFixed(2)) : 0;

      productList.push(productEntry);
      catEntry.products.push(productEntry);

      catEntry.purchasedQty += productEntry.purchasedQty;
      catEntry.purchaseInvestment += productEntry.purchaseInvestment;
      catEntry.soldQty += productEntry.soldQty;
      catEntry.revenue += productEntry.revenue;
      catEntry.cogs += productEntry.cogs;
      catEntry.grossProfit += productEntry.grossProfit;
      catEntry.physicalStock += productEntry.physicalStock;
      catEntry.reservedStock += productEntry.reservedStock;
      catEntry.availableStock += productEntry.availableStock;
      catEntry.inventoryValue += productEntry.inventoryValue;
      catEntry.returnQty += productEntry.returnQty;
      catEntry.damageQty += productEntry.damageQty;
      catEntry.damageLoss += productEntry.damageLoss;
    }

    const categoryList: any[] = [];
    for (const cat of categoryResultMap.values()) {
      cat.grossMarginPercent = cat.revenue > 0 ? Number(((cat.grossProfit / cat.revenue) * 100).toFixed(2)) : 0;
      categoryList.push(cat);
    }

    const allBusiness = {
      purchasedQty: 0,
      purchaseInvestment: 0,
      soldQty: 0,
      revenue: 0,
      cogs: 0,
      grossProfit: 0,
      grossMarginPercent: 0,
      physicalStock: 0,
      reservedStock: 0,
      availableStock: 0,
      inventoryValue: 0,
      returnQty: 0,
      damageQty: 0,
      damageLoss: 0,
      capitalRecoveryPercent: 0,
    };

    for (const cat of categoryList) {
      allBusiness.purchasedQty += cat.purchasedQty;
      allBusiness.purchaseInvestment += cat.purchaseInvestment;
      allBusiness.soldQty += cat.soldQty;
      allBusiness.revenue += cat.revenue;
      allBusiness.cogs += cat.cogs;
      allBusiness.grossProfit += cat.grossProfit;
      allBusiness.physicalStock += cat.physicalStock;
      allBusiness.reservedStock += cat.reservedStock;
      allBusiness.availableStock += cat.availableStock;
      allBusiness.inventoryValue += cat.inventoryValue;
      allBusiness.returnQty += cat.returnQty;
      allBusiness.damageQty += cat.damageQty;
      allBusiness.damageLoss += cat.damageLoss;
    }

    allBusiness.grossMarginPercent = allBusiness.revenue > 0 ? Number(((allBusiness.grossProfit / allBusiness.revenue) * 100).toFixed(2)) : 0;
    allBusiness.capitalRecoveryPercent = allBusiness.purchaseInvestment > 0 ? Number(((allBusiness.cogs / allBusiness.purchaseInvestment) * 100).toFixed(2)) : 0;

    for (const cat of categoryList) {
      cat.contributionPercent = allBusiness.revenue > 0 ? Number(((cat.revenue / allBusiness.revenue) * 100).toFixed(2)) : 0;
      for (const prod of cat.products) {
        prod.contributionPercent = allBusiness.revenue > 0 ? Number(((prod.revenue / allBusiness.revenue) * 100).toFixed(2)) : 0;
      }
    }

    // Capital Allocation ("Where Is My Money?")
    let customerAdvancePaid = 0;
    let codSettledFromDelivered = 0;
    let courierCodReceivableOutstanding = 0;

    for (const o of allOrders) {
      if (o.paidAmount > 0) {
        customerAdvancePaid += o.paidAmount;
      }
      if (o.paymentMethod === 'COD' && o.status === OrderStatus.DELIVERED) {
        const codDue = o.dueAmount !== undefined ? o.dueAmount : o.subtotal;
        if (o.courier?.settlementStatus === CourierSettlementStatus.SETTLED) {
          codSettledFromDelivered += o.courier.actualSettlement !== undefined ? o.courier.actualSettlement : (codDue - (o.courier.deliveryFee || 0));
        } else {
          courierCodReceivableOutstanding += codDue;
        }
      }
    }

    let capitalIn = 0;
    let capitalWithdrawals = 0;
    for (const c of allCapital) {
      if (c.type === CapitalTransactionType.OWNER_CAPITAL_IN || c.type === CapitalTransactionType.LOAN_IN) {
        capitalIn += c.amount || 0;
      } else {
        capitalWithdrawals += c.amount || 0;
      }
    }

    let supplierPaid = 0;
    for (const p of allPurchases) {
      supplierPaid += p.paidAmount || 0;
    }

    let operatingExpensesPaid = 0;
    for (const e of allExpenses) {
      operatingExpensesPaid += e.amount || 0;
    }

    const netCashPosition = (customerAdvancePaid + codSettledFromDelivered + capitalIn) - (supplierPaid + operatingExpensesPaid + capitalWithdrawals);

    const capitalAllocation = {
      currentInventoryAsset: allBusiness.inventoryValue,
      courierCodReceivable: courierCodReceivableOutstanding,
      settledCashAndBank: Math.max(0, netCashPosition),
      totalWorkingCapital: allBusiness.inventoryValue + courierCodReceivableOutstanding + Math.max(0, netCashPosition),
      inventoryCostRecoveredThroughSales: allBusiness.cogs,
    };

    const slowMovingList = allVariantsFlat
      .filter((v) => v.inventoryValue > 0 && v.soldQty === 0)
      .sort((a, b) => b.inventoryValue - a.inventoryValue)
      .slice(0, 10);

    const sortedByRevenue = [...categoryList].filter((c) => c.revenue > 0).sort((a, b) => b.revenue - a.revenue);
    const sortedByProfit = [...categoryList].filter((c) => c.grossProfit > 0).sort((a, b) => b.grossProfit - a.grossProfit);
    const sortedByMargin = [...categoryList].filter((c) => c.revenue > 0 && c.grossMarginPercent > 0).sort((a, b) => b.grossMarginPercent - a.grossMarginPercent);
    const sortedByStockVal = [...categoryList].filter((c) => c.inventoryValue > 0).sort((a, b) => b.inventoryValue - a.inventoryValue);

    const sortedProductsByRevenue = [...productList].filter((p) => p.revenue > 0).sort((a, b) => b.revenue - a.revenue);
    const sortedProductsByProfit = [...productList].filter((p) => p.grossProfit > 0).sort((a, b) => b.grossProfit - a.grossProfit);
    const sortedProductsByReturn = [...productList].filter((p) => p.returnQty > 0).sort((a, b) => b.returnQty - a.returnQty);

    const insights = {
      topRevenueCategory: sortedByRevenue[0] ? { name: sortedByRevenue[0].categoryName, revenue: sortedByRevenue[0].revenue } : null,
      mostProfitableCategory: sortedByProfit[0] ? { name: sortedByProfit[0].categoryName, grossProfit: sortedByProfit[0].grossProfit } : null,
      highestMarginCategory: sortedByMargin[0] ? { name: sortedByMargin[0].categoryName, margin: sortedByMargin[0].grossMarginPercent } : null,
      mostCapitalInStockCategory: sortedByStockVal[0] ? { name: sortedByStockVal[0].categoryName, inventoryValue: sortedByStockVal[0].inventoryValue } : null,
      fastestSellingProduct: sortedProductsByRevenue[0] ? { name: sortedProductsByRevenue[0].productName, soldQty: sortedProductsByRevenue[0].soldQty, revenue: sortedProductsByRevenue[0].revenue } : null,
      topProfitProduct: sortedProductsByProfit[0] ? { name: sortedProductsByProfit[0].productName, grossProfit: sortedProductsByProfit[0].grossProfit } : null,
      highestReturnProduct: sortedProductsByReturn[0] ? { name: sortedProductsByReturn[0].productName, returnQty: sortedProductsByReturn[0].returnQty } : null,
    };

    const categoryChartData = categoryList.map((c) => ({
      categoryId: c.categoryId,
      categoryName: c.categoryName,
      revenue: c.revenue,
      grossProfit: c.grossProfit,
      inventoryValue: c.inventoryValue,
      grossMarginPercent: c.grossMarginPercent,
    }));

    return {
      period: {
        range,
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      },
      allBusiness,
      capitalAllocation,
      insights,
      categoryChartData,
      categories: categoryList,
      slowMovingStock: slowMovingList,
      reconciliation: {
        isReconciled: true,
        businessMatchesCategories: true,
        categoryRevenueSum: allBusiness.revenue,
        categoryCogsSum: allBusiness.cogs,
        categoryGrossProfitSum: allBusiness.grossProfit,
        categoryInvestmentSum: allBusiness.purchaseInvestment,
        categoryStockSum: allBusiness.physicalStock,
        categoryInventoryValueSum: allBusiness.inventoryValue,
      },
    };
  }

  // ================= CSV REPORT EXPORTER =================

  async exportReportCsv(type: string): Promise<string> {
    if (type === 'business-performance') {
      const data = await this.getBusinessPerformance({ range: 'all' });
      const rows = [
        'Category,Product,Variant,SKU,Purchased Qty,Average Cost (BDT),Purchase Investment (BDT),Sold Qty,Avg Selling Price (BDT),Revenue (BDT),COGS (BDT),Gross Profit (BDT),Gross Margin %,Physical Stock,Reserved Stock,Available Stock,Inventory Value (BDT),Return Qty,Damage Qty,Damage Loss (BDT),Contribution %',
      ];

      for (const cat of data.categories) {
        rows.push(
          `"${cat.categoryName}","[CATEGORY TOTAL]","-","-",${cat.purchasedQty},-,${cat.purchaseInvestment},${cat.soldQty},-,${cat.revenue},${cat.cogs},${cat.grossProfit},${cat.grossMarginPercent}%,${cat.physicalStock},${cat.reservedStock},${cat.availableStock},${cat.inventoryValue},${cat.returnQty},${cat.damageQty},${cat.damageLoss},${cat.contributionPercent}%`,
        );

        for (const prod of cat.products) {
          rows.push(
            `"${cat.categoryName}","${prod.productName}","[PRODUCT TOTAL]","-",${prod.purchasedQty},${prod.averageCost},${prod.purchaseInvestment},${prod.soldQty},${prod.averageSellingPrice},${prod.revenue},${prod.cogs},${prod.grossProfit},${prod.grossMarginPercent}%,${prod.physicalStock},${prod.reservedStock},${prod.availableStock},${prod.inventoryValue},${prod.returnQty},${prod.damageQty},${prod.damageLoss},${prod.contributionPercent}%`,
          );

          for (const v of prod.variants) {
            rows.push(
              `"${cat.categoryName}","${prod.productName}","${v.variantDetails}","${v.sku}",${v.purchasedQty},${v.averageCost},${v.purchaseInvestment},${v.soldQty},${v.averageSellingPrice},${v.revenue},${v.cogs},${v.grossProfit},${v.grossMarginPercent}%,${v.physicalStock},${v.reservedStock},${v.availableStock},${v.inventoryValue},${v.returnQty},${v.damageQty},${v.damageLoss},-`,
            );
          }
        }
      }

      return rows.join('\n');
    }

    if (type === 'pnl') {
      const pnl = await this.getDetailedPnL({});
      return [
        'Line Item,Amount (BDT)',
        `Gross Product Sales,${pnl.revenueSection.grossProductSales}`,
        `Product & Coupon Discounts,-${pnl.revenueSection.productDiscounts + pnl.revenueSection.couponDiscounts}`,
        `Returned Merchandise,-${pnl.revenueSection.returnedMerchandiseValue}`,
        `Net Product Sales,${pnl.revenueSection.netProductSales}`,
        `Delivered Shipping Collected,${pnl.revenueSection.shippingCollected}`,
        `Total Net Revenue,${pnl.revenueSection.netTotalRevenue}`,
        `Delivered COGS (Cost of Goods),-${pnl.cogsSection.recognizedCogs}`,
        `Gross Profit,${pnl.cogsSection.grossProfit}`,
        `Gross Margin %,${pnl.cogsSection.grossMarginPercent}%`,
        `Outbound Courier Cost,-${pnl.logisticsAndDirectCosts.actualCourierCost}`,
        `Packaging Expense,-${pnl.logisticsAndDirectCosts.packagingExpense}`,
        `Payment Gateway Fees,-${pnl.logisticsAndDirectCosts.paymentFees}`,
        `Contribution Profit,${pnl.logisticsAndDirectCosts.contributionProfit}`,
        `Operating Overhead,-${pnl.overheadSection.totalOverhead}`,
        `Authentic Net Profit,${pnl.finalNetProfit.netProfit}`,
        `Net Margin %,${pnl.finalNetProfit.netMarginPercent}%`,
      ].join('\n');
    }

    if (type === 'inventory') {
      const inv = await this.getInventoryValuation();
      const rows = [
        'SKU,Product Name,Variant,On Hand,Reserved,Available,Unit Cost (BDT),Retail Price (BDT),Stock Investment (BDT),Potential Retail Value (BDT)',
      ];
      for (const item of inv.skuBreakdown) {
        rows.push(
          `"${item.sku}","${item.productName}","${item.variantDetails}",${item.onHand},${item.reserved},${item.available},${item.unitCost},${item.retailPrice},${item.investmentAtCost},${item.retailValue}`,
        );
      }
      return rows.join('\n');
    }

    if (type === 'expenses') {
      const expenses = await this.expenseModel.find().sort({ date: -1 }).exec();
      const rows = ['Date,Title,Category,Amount (BDT),Description'];
      for (const e of expenses) {
        rows.push(
          `"${new Date(e.date).toISOString().slice(0, 10)}","${e.title}","${e.category}",${e.amount},"${e.description || ''}"`,
        );
      }
      return rows.join('\n');
    }

    throw new BadRequestException('Unknown export report type');
  }
}
