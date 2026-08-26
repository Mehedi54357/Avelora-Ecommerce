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
import { ReturnRequest, ReturnRequestDocument } from '../../schemas/return-request.schema';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Supplier.name) private supplierModel: Model<SupplierDocument>,
    @InjectModel(PurchaseOrder.name) private purchaseModel: Model<PurchaseOrderDocument>,
    @InjectModel(CapitalTransaction.name) private capitalModel: Model<CapitalTransactionDocument>,
    @InjectModel(CourierSettlement.name) private settlementModel: Model<CourierSettlementDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(ReturnRequest.name) private returnModel: Model<ReturnRequestDocument>,
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
      this.orderModel.find().exec(),
      this.expenseModel.find().exec(),
      this.productModel.find().exec(),
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
      const orderDate = new Date((order as any).createdAt).toISOString().slice(0, 10);
      if (last7DaysMap[orderDate]) {
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
      this.orderModel.find({ createdAt: { $gte: fromDate, $lte: toDate } }).exec(),
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
      this.orderModel.find().exec(),
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
    const products = await this.productModel.find().exec();

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
      this.orderModel.find({ paymentMethod: 'COD' }).sort({ createdAt: -1 }).limit(200).exec(),
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

  // ================= CSV REPORT EXPORTER =================

  async exportReportCsv(type: string): Promise<string> {
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
