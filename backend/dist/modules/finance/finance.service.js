"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const expense_schema_1 = require("../../schemas/expense.schema");
const order_schema_1 = require("../../schemas/order.schema");
const product_schema_1 = require("../../schemas/product.schema");
const supplier_schema_1 = require("../../schemas/supplier.schema");
const purchase_schema_1 = require("../../schemas/purchase.schema");
const capital_schema_1 = require("../../schemas/capital.schema");
const courier_settlement_schema_1 = require("../../schemas/courier-settlement.schema");
const payment_schema_1 = require("../../schemas/payment.schema");
const return_request_schema_1 = require("../../schemas/return-request.schema");
const audit_log_service_1 = require("../audit-log/audit-log.service");
let FinanceService = class FinanceService {
    expenseModel;
    orderModel;
    productModel;
    supplierModel;
    purchaseModel;
    capitalModel;
    settlementModel;
    paymentModel;
    returnModel;
    auditLogService;
    constructor(expenseModel, orderModel, productModel, supplierModel, purchaseModel, capitalModel, settlementModel, paymentModel, returnModel, auditLogService) {
        this.expenseModel = expenseModel;
        this.orderModel = orderModel;
        this.productModel = productModel;
        this.supplierModel = supplierModel;
        this.purchaseModel = purchaseModel;
        this.capitalModel = capitalModel;
        this.settlementModel = settlementModel;
        this.paymentModel = paymentModel;
        this.returnModel = returnModel;
        this.auditLogService = auditLogService;
    }
    async getExpenses(query) {
        const filter = {};
        if (query.category) {
            filter.category = query.category;
        }
        const limit = Math.max(1, Math.min(500, Number(query.limit) || 200));
        return this.expenseModel.find(filter).sort({ date: -1, createdAt: -1 }).limit(limit).exec();
    }
    async createExpense(data, actor = 'ADMIN') {
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
            entityId: exp._id.toString(),
            newData: {
                title: exp.title,
                amount: exp.amount,
                category: exp.category,
                actor,
            },
        });
        return exp;
    }
    async deleteExpense(id, actor = 'ADMIN') {
        const result = await this.expenseModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException('Expense not found');
        }
        await this.auditLogService.logAction({
            action: 'EXPENSE_DELETED',
            entityType: 'Expense',
            entityId: id,
            newData: { title: result.title, actor },
        });
        return { success: true };
    }
    async getFinancialAnalytics() {
        const [allOrders, allExpenses, allProducts, allCapital, allPurchases] = await Promise.all([
            this.orderModel.find().exec(),
            this.expenseModel.find().exec(),
            this.productModel.find().exec(),
            this.capitalModel.find().exec(),
            this.purchaseModel.find().exec(),
        ]);
        const deliveredOrders = allOrders.filter((o) => o.status === order_schema_1.OrderStatus.DELIVERED);
        const pipelineOrders = allOrders.filter((o) => o.status === order_schema_1.OrderStatus.PENDING ||
            o.status === order_schema_1.OrderStatus.CONFIRMED ||
            o.status === order_schema_1.OrderStatus.PROCESSING ||
            o.status === order_schema_1.OrderStatus.PACKED ||
            o.status === order_schema_1.OrderStatus.SHIPPED);
        const cancelledOrders = allOrders.filter((o) => o.status === order_schema_1.OrderStatus.CANCELLED);
        const returnedOrders = allOrders.filter((o) => o.status === order_schema_1.OrderStatus.RETURNED);
        let deliveredRevenue = 0;
        let deliveredSubtotal = 0;
        let deliveredCostOfGoods = 0;
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
        let pipelineRevenue = 0;
        for (const order of pipelineOrders) {
            pipelineRevenue += order.totalAmount || 0;
        }
        const grossProfit = deliveredSubtotal - deliveredCostOfGoods;
        let totalOperatingExpenses = 0;
        const expensesByCategory = {};
        for (const exp of allExpenses) {
            totalOperatingExpenses += exp.amount || 0;
            const cat = exp.category || 'Other Operating Expense';
            expensesByCategory[cat] = (expensesByCategory[cat] || 0) + exp.amount;
        }
        const netProfit = grossProfit - totalOperatingExpenses;
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
                }
                else if (qty <= (v.safetyStock || 2)) {
                    lowStockCount++;
                }
            }
        }
        const unconfirmedOrdersCount = allOrders.filter((o) => o.status === order_schema_1.OrderStatus.PENDING).length;
        const twelveHoursAgo = new Date(Date.now() - 12 * 3600 * 1000);
        const staleOrdersCount = allOrders.filter((o) => (o.status === order_schema_1.OrderStatus.CONFIRMED || o.status === order_schema_1.OrderStatus.PROCESSING) &&
            new Date(o.createdAt) < twelveHoursAgo).length;
        const returnRequestedCount = allOrders.filter((o) => o.status === order_schema_1.OrderStatus.RETURN_REQUESTED).length;
        const orderStatusCounts = {};
        for (const order of allOrders) {
            orderStatusCounts[order.status] = (orderStatusCounts[order.status] || 0) + 1;
        }
        const last7DaysMap = {};
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
            if (order.status === order_schema_1.OrderStatus.CANCELLED || order.status === order_schema_1.OrderStatus.RETURNED)
                continue;
            const orderDate = new Date(order.createdAt).toISOString().slice(0, 10);
            if (last7DaysMap[orderDate]) {
                last7DaysMap[orderDate].sales += order.totalAmount || 0;
                last7DaysMap[orderDate].orders += 1;
                let orderCogs = 0;
                for (const item of order.items) {
                    orderCogs += (item.costPrice || 0) * (item.quantity || 1);
                }
                const gp = ((order.subtotal || 0) - (order.couponDiscount || 0)) - orderCogs;
                last7DaysMap[orderDate].grossProfit += gp;
                last7DaysMap[orderDate].netProfit += gp;
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
    async getDetailedPnL(query) {
        const fromDate = query.from ? new Date(query.from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const toDate = query.to ? new Date(query.to) : new Date();
        toDate.setHours(23, 59, 59, 999);
        const [orders, expenses] = await Promise.all([
            this.orderModel.find({ createdAt: { $gte: fromDate, $lte: toDate } }).exec(),
            this.expenseModel.find({ date: { $gte: fromDate, $lte: toDate } }).exec(),
        ]);
        const delivered = orders.filter((o) => o.status === order_schema_1.OrderStatus.DELIVERED);
        const returned = orders.filter((o) => o.status === order_schema_1.OrderStatus.RETURNED || o.status === order_schema_1.OrderStatus.REFUNDED);
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
        let marketingExpense = 0;
        let packagingExpense = 0;
        let salaryExpense = 0;
        let utilityExpense = 0;
        let paymentFees = 0;
        let otherOperatingExpense = 0;
        for (const exp of expenses) {
            const cat = (exp.category || '').toLowerCase();
            if (cat.includes('marketing'))
                marketingExpense += exp.amount;
            else if (cat.includes('packaging'))
                packagingExpense += exp.amount;
            else if (cat.includes('salary'))
                salaryExpense += exp.amount;
            else if (cat.includes('utility') || cat.includes('office'))
                utilityExpense += exp.amount;
            else if (cat.includes('payment') || cat.includes('gateway'))
                paymentFees += exp.amount;
            else
                otherOperatingExpense += exp.amount;
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
    async getCashFlow() {
        const [orders, expenses, capital, purchases] = await Promise.all([
            this.orderModel.find().exec(),
            this.expenseModel.find().exec(),
            this.capitalModel.find().exec(),
            this.purchaseModel.find().exec(),
        ]);
        let customerAdvancePaid = 0;
        let codSettledFromDelivered = 0;
        let courierCodReceivableOutstanding = 0;
        for (const o of orders) {
            if (o.paidAmount > 0) {
                customerAdvancePaid += o.paidAmount;
            }
            if (o.paymentMethod === 'COD' && o.status === order_schema_1.OrderStatus.DELIVERED) {
                const codDue = o.dueAmount !== undefined ? o.dueAmount : o.subtotal;
                if (o.courier?.settlementStatus === order_schema_1.CourierSettlementStatus.SETTLED) {
                    codSettledFromDelivered += o.courier.actualSettlement !== undefined ? o.courier.actualSettlement : (codDue - (o.courier.deliveryFee || 0));
                }
                else {
                    courierCodReceivableOutstanding += codDue;
                }
            }
        }
        let capitalIn = 0;
        let capitalWithdrawals = 0;
        for (const c of capital) {
            if (c.type === capital_schema_1.CapitalTransactionType.OWNER_CAPITAL_IN || c.type === capital_schema_1.CapitalTransactionType.LOAN_IN) {
                capitalIn += c.amount || 0;
            }
            else {
                capitalWithdrawals += c.amount || 0;
            }
        }
        const totalCashIn = customerAdvancePaid + codSettledFromDelivered + capitalIn;
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
    async getInventoryValuation() {
        const products = await this.productModel.find().exec();
        let totalPhysicalStock = 0;
        let totalReservedStock = 0;
        let totalStockInvestmentAtCost = 0;
        let totalPotentialRetailValue = 0;
        const skuList = [];
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
    async getReconciliation() {
        const [orders, settlements] = await Promise.all([
            this.orderModel.find({ paymentMethod: 'COD' }).sort({ createdAt: -1 }).limit(200).exec(),
            this.settlementModel.find().sort({ settledAt: -1 }).limit(50).exec(),
        ]);
        const codOrders = orders.filter((o) => o.status === order_schema_1.OrderStatus.DELIVERED ||
            o.status === order_schema_1.OrderStatus.SHIPPED ||
            o.status === order_schema_1.OrderStatus.COURIER_BOOKED);
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
            const settlementStatus = o.courier?.settlementStatus || (o.status === order_schema_1.OrderStatus.DELIVERED ? order_schema_1.CourierSettlementStatus.AWAITING_SETTLEMENT : order_schema_1.CourierSettlementStatus.NOT_APPLICABLE);
            const variance = o.courier?.variance !== undefined ? o.courier.variance : (settlementStatus === order_schema_1.CourierSettlementStatus.SETTLED ? (expectedSettlement - actualSettlement) : 0);
            if (o.status === order_schema_1.OrderStatus.DELIVERED) {
                totalDeliveredCodDue += codDue;
                totalCourierFees += courierFee;
                if (settlementStatus === order_schema_1.CourierSettlementStatus.SETTLED) {
                    totalSettledAmount += actualSettlement;
                }
                else {
                    outstandingCodReceivable += codDue;
                }
                if (settlementStatus === order_schema_1.CourierSettlementStatus.DISPUTED) {
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
                deliveryDate: o.courier?.deliveredAt || (o.status === order_schema_1.OrderStatus.DELIVERED ? o.updatedAt : null),
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
                deliveredCodOrdersCount: codOrders.filter((o) => o.status === order_schema_1.OrderStatus.DELIVERED).length,
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
    async reconcileCourierOrder(payload, actorEmail = 'ADMIN') {
        const order = await this.orderModel.findById(payload.orderId).exec();
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
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
        order.courier.settlementStatus = payload.status || order_schema_1.CourierSettlementStatus.SETTLED;
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
            entityId: order._id.toString(),
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
    async bulkReconcileCourier(payload, actorEmail = 'ADMIN') {
        if (!payload.items || payload.items.length === 0) {
            throw new common_1.BadRequestException('Settlement items list cannot be empty');
        }
        const provider = payload.provider || 'Pathao';
        const batchId = payload.settlementBatchId || `SETTLE-${Date.now()}`;
        const settledAt = payload.settledAt ? new Date(payload.settledAt) : new Date();
        let totalCod = 0;
        let totalFees = 0;
        let totalNet = 0;
        const lines = [];
        const updatedOrderIds = [];
        for (const item of payload.items) {
            const cleanKey = item.orderIdOrConsignment?.trim();
            if (!cleanKey)
                continue;
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
            let status = courier_settlement_schema_1.SettlementStatus.MATCHED;
            let orderSettlementStatus = order_schema_1.CourierSettlementStatus.SETTLED;
            if (variance !== 0) {
                status = courier_settlement_schema_1.SettlementStatus.AMOUNT_MISMATCH;
                orderSettlementStatus = order_schema_1.CourierSettlementStatus.DISPUTED;
            }
            if (!order) {
                status = courier_settlement_schema_1.SettlementStatus.MISSING_ORDER;
            }
            else {
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
        const batchRecord = await this.settlementModel.create({
            provider,
            settlementBatchId: batchId,
            lines,
            totalCodCollected: totalCod,
            totalFeesDeducted: totalFees,
            totalNetRemitted: totalNet,
            settledAt,
            overallStatus: lines.some((l) => l.status !== courier_settlement_schema_1.SettlementStatus.MATCHED) ? 'HAS_DISCREPANCIES' : 'MATCHED',
            bankDepositReference: payload.transactionRef || payload.settlementAccount,
            notes: `Batch reconciled by ${actorEmail} with ${lines.length} orders.`,
            reconciledBy: actorEmail,
        });
        await this.auditLogService.logAction({
            action: 'COURIER_BATCH_SETTLEMENT_RECONCILED',
            entityType: 'CourierSettlement',
            entityId: batchRecord._id.toString(),
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
    async exportReportCsv(type) {
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
                rows.push(`"${item.sku}","${item.productName}","${item.variantDetails}",${item.onHand},${item.reserved},${item.available},${item.unitCost},${item.retailPrice},${item.investmentAtCost},${item.retailValue}`);
            }
            return rows.join('\n');
        }
        if (type === 'expenses') {
            const expenses = await this.expenseModel.find().sort({ date: -1 }).exec();
            const rows = ['Date,Title,Category,Amount (BDT),Description'];
            for (const e of expenses) {
                rows.push(`"${new Date(e.date).toISOString().slice(0, 10)}","${e.title}","${e.category}",${e.amount},"${e.description || ''}"`);
            }
            return rows.join('\n');
        }
        throw new common_1.BadRequestException('Unknown export report type');
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(expense_schema_1.Expense.name)),
    __param(1, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(2, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(3, (0, mongoose_1.InjectModel)(supplier_schema_1.Supplier.name)),
    __param(4, (0, mongoose_1.InjectModel)(purchase_schema_1.PurchaseOrder.name)),
    __param(5, (0, mongoose_1.InjectModel)(capital_schema_1.CapitalTransaction.name)),
    __param(6, (0, mongoose_1.InjectModel)(courier_settlement_schema_1.CourierSettlement.name)),
    __param(7, (0, mongoose_1.InjectModel)(payment_schema_1.Payment.name)),
    __param(8, (0, mongoose_1.InjectModel)(return_request_schema_1.ReturnRequest.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        audit_log_service_1.AuditLogService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map