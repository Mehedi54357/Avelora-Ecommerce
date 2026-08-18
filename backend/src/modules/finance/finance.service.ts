import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense, ExpenseDocument } from '../../schemas/expense.schema';
import { Order, OrderDocument, OrderStatus } from '../../schemas/order.schema';

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async getExpenses(query: { category?: string; limit?: number }) {
    const filter: any = {};
    if (query.category) {
      filter.category = query.category;
    }
    const limit = Math.max(1, Math.min(200, Number(query.limit) || 100));
    return this.expenseModel.find(filter).sort({ date: -1, createdAt: -1 }).limit(limit).exec();
  }

  async createExpense(data: Partial<Expense>): Promise<Expense> {
    return this.expenseModel.create({
      title: data.title,
      category: data.category,
      amount: Number(data.amount) || 0,
      date: data.date ? new Date(data.date) : new Date(),
      description: data.description || '',
    });
  }

  async deleteExpense(id: string) {
    const result = await this.expenseModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Expense not found');
    }
    return { success: true };
  }

  async getFinancialAnalytics() {
    const [allOrders, allExpenses] = await Promise.all([
      this.orderModel.find().exec(),
      this.expenseModel.find().exec(),
    ]);

    // 1. Delivered / Fulfilled Orders (Realized Basis)
    const deliveredOrders = allOrders.filter((o) => o.status === OrderStatus.DELIVERED);

    // 2. Active Pipeline Orders (Pending, Confirmed, Processing, Shipped)
    const pipelineOrders = allOrders.filter(
      (o) =>
        o.status === OrderStatus.PENDING ||
        o.status === OrderStatus.CONFIRMED ||
        o.status === OrderStatus.PROCESSING ||
        o.status === OrderStatus.SHIPPED,
    );

    let deliveredRevenue = 0;
    let deliveredSubtotal = 0;
    let deliveredCostOfGoods = 0; // COGS
    let deliveredDeliveryCharge = 0;

    for (const order of deliveredOrders) {
      deliveredRevenue += order.totalAmount || 0;
      deliveredSubtotal += order.subtotal || 0;
      deliveredDeliveryCharge += order.deliveryCharge || 0;

      for (const item of order.items) {
        deliveredCostOfGoods += (item.costPrice || 0) * (item.quantity || 1);
      }
    }

    // Pipeline Revenue (Orders awaiting fulfillment)
    let pipelineRevenue = 0;
    for (const order of pipelineOrders) {
      pipelineRevenue += order.totalAmount || 0;
    }

    // Gross Profit from Delivered Orders
    const grossProfit = deliveredSubtotal - deliveredCostOfGoods;

    // Total Operating Expenses (Packaging, Delivery, Marketing, Payment fees, General)
    let totalOperatingExpenses = 0;
    const expensesByCategory: Record<string, number> = {};

    for (const exp of allExpenses) {
      totalOperatingExpenses += exp.amount || 0;
      const cat = exp.category || 'Other Operating Expense';
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + exp.amount;
    }

    // Authentic Net Profit = Gross Profit - Operating Expenses (Zero double counting)
    const netProfit = grossProfit - totalOperatingExpenses;

    // Order status counts
    const orderStatusCounts: Record<string, number> = {};
    for (const order of allOrders) {
      orderStatusCounts[order.status] = (orderStatusCounts[order.status] || 0) + 1;
    }

    // 7-day daily activity
    const last7DaysMap: Record<string, { date: string; sales: number; orders: number; grossProfit: number }> = {};
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
        last7DaysMap[orderDate].grossProfit += (order.subtotal || 0) - orderCogs;
      }
    }

    return {
      summary: {
        totalOrders: allOrders.length,
        deliveredOrdersCount: deliveredOrders.length,
        pipelineOrdersCount: pipelineOrders.length,
        cancelledOrdersCount: orderStatusCounts[OrderStatus.CANCELLED] || 0,
        // Realized Metrics
        realizedRevenue: deliveredRevenue,
        deliveredSubtotal,
        deliveredCostOfGoods,
        grossProfit,
        grossProfitMargin: deliveredSubtotal > 0 ? ((grossProfit / deliveredSubtotal) * 100).toFixed(1) : '0',
        totalOperatingExpenses,
        netProfit,
        netProfitMargin: deliveredRevenue > 0 ? ((netProfit / deliveredRevenue) * 100).toFixed(1) : '0',
        // Pipeline
        pipelineRevenue,
        totalPlacedValue: deliveredRevenue + pipelineRevenue,
      },
      expensesByCategory,
      orderStatusCounts,
      dailySales: Object.values(last7DaysMap),
      recentExpenses: allExpenses.slice(-5).reverse(),
    };
  }
}
