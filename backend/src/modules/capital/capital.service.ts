import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CapitalTransaction,
  CapitalTransactionDocument,
  CapitalTransactionType,
} from '../../schemas/capital.schema';
import {
  ProductInvestment,
  ProductInvestmentDocument,
} from '../../schemas/product-investment.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import {
  InventoryTransaction,
  InventoryTransactionDocument,
  InventoryTransactionType,
} from '../../schemas/inventory-transaction.schema';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class CapitalService {
  constructor(
    @InjectModel(CapitalTransaction.name)
    private capitalModel: Model<CapitalTransactionDocument>,
    @InjectModel(ProductInvestment.name)
    private productInvestmentModel: Model<ProductInvestmentDocument>,
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    @InjectModel(InventoryTransaction.name)
    private transactionModel: Model<InventoryTransactionDocument>,
    private auditLogService: AuditLogService,
  ) {}

  // ================= GENERAL CAPITAL TRANSACTIONS =================

  async getTransactions(query: { type?: string; limit?: number }) {
    const filter: any = {};
    if (query.type) filter.type = query.type;
    const limit = Math.max(1, Math.min(200, Number(query.limit) || 100));
    return this.capitalModel.find(filter).sort({ date: -1, createdAt: -1 }).limit(limit).exec();
  }

  async createTransaction(data: Partial<CapitalTransaction>, actor: string = 'ADMIN') {
    const amount = Number(data.amount) || 0;
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const tx = await this.capitalModel.create({
      type: data.type || CapitalTransactionType.OWNER_CAPITAL_IN,
      amount,
      source: data.source || 'Owner',
      account: data.account || 'Bank Account',
      date: data.date ? new Date(data.date) : new Date(),
      reference: data.reference || '',
      notes: data.notes || '',
      recordedBy: actor,
    });

    await this.auditLogService.logAction({
      action: 'CAPITAL_TRANSACTION_RECORDED',
      entityType: 'CapitalTransaction',
      entityId: (tx as any)._id.toString(),
      newData: {
        type: tx.type,
        amount: tx.amount,
        source: tx.source,
        actor,
      },
    });

    return tx;
  }

  async deleteTransaction(id: string, actor: string = 'ADMIN') {
    const tx = await this.capitalModel.findByIdAndDelete(id).exec();
    if (!tx) throw new NotFoundException('Capital transaction not found');

    await this.auditLogService.logAction({
      action: 'CAPITAL_TRANSACTION_DELETED',
      entityType: 'CapitalTransaction',
      entityId: id,
      newData: {
        type: tx.type,
        amount: tx.amount,
        actor,
      },
    });

    return { success: true };
  }

  async getCapitalSummary() {
    const [allCapital, allProductInvestments] = await Promise.all([
      this.capitalModel.find().exec(),
      this.productInvestmentModel.find().exec(),
    ]);

    let totalCapitalIn = 0;
    let totalWithdrawals = 0;
    let totalLoansIn = 0;
    let totalLoansRepaid = 0;

    for (const tx of allCapital) {
      if (tx.type === CapitalTransactionType.OWNER_CAPITAL_IN) {
        totalCapitalIn += tx.amount || 0;
      } else if (tx.type === CapitalTransactionType.OWNER_WITHDRAWAL) {
        totalWithdrawals += tx.amount || 0;
      } else if (tx.type === CapitalTransactionType.LOAN_IN) {
        totalLoansIn += tx.amount || 0;
      } else if (tx.type === CapitalTransactionType.LOAN_REPAYMENT) {
        totalLoansRepaid += tx.amount || 0;
      }
    }

    let totalProductInvestmentAmount = 0;
    let totalUnitsInvested = 0;
    for (const pi of allProductInvestments) {
      totalProductInvestmentAmount += pi.totalInvestment || 0;
      totalUnitsInvested += pi.quantity || 0;
    }

    const netCapital = totalCapitalIn - totalWithdrawals;
    const netLoans = totalLoansIn - totalLoansRepaid;

    return {
      totalCapitalIn,
      totalWithdrawals,
      netCapital,
      totalLoansIn,
      totalLoansRepaid,
      netLoans,
      totalEquityAndDebt: netCapital + netLoans,
      totalProductInvestmentAmount,
      totalUnitsInvested,
      productInvestmentsCount: allProductInvestments.length,
      recentTransactions: allCapital.slice(-10).reverse(),
    };
  }

  // ================= PRODUCT-BASED INVESTMENT & ACTUAL COST SYSTEM =================

  async getProductInvestments(query: {
    from?: string;
    to?: string;
    productId?: string;
    search?: string;
    limit?: number;
  }) {
    const filter: any = {};

    if (query.productId && Types.ObjectId.isValid(query.productId)) {
      filter.productId = new Types.ObjectId(query.productId);
    }

    if (query.from || query.to) {
      filter.date = {};
      if (query.from) {
        const fromDate = new Date(query.from);
        fromDate.setHours(0, 0, 0, 0);
        filter.date.$gte = fromDate;
      }
      if (query.to) {
        const toDate = new Date(query.to);
        toDate.setHours(23, 59, 59, 999);
        filter.date.$lte = toDate;
      }
    }

    if (query.search) {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { productName: regex },
        { variantSku: regex },
        { investmentId: regex },
      ];
    }

    const limit = Math.max(1, Math.min(500, Number(query.limit) || 200));

    const investments = await this.productInvestmentModel
      .find(filter)
      .sort({ date: -1, createdAt: -1 })
      .limit(limit)
      .exec();

    // Attach live product stock & variant info for live accurate display
    const enriched = await Promise.all(
      investments.map(async (inv) => {
        const prod = await this.productModel
          .findById(inv.productId)
          .select('name images variants')
          .exec();
        const variant = prod?.variants?.find((v) => v.sku === inv.variantSku);
        const liveStock = variant ? variant.stockQuantity : inv.remainingStock;
        const liveWac = variant ? variant.weightedAverageCost : inv.actualCostPerUnit;

        return {
          ...inv.toObject(),
          productImage: (prod?.images && prod.images[0]) || '',
          liveStock: liveStock ?? 0,
          liveWac: liveWac ?? inv.actualCostPerUnit,
        };
      }),
    );

    return enriched;
  }

  async createProductInvestment(data: any, actor: string = 'ADMIN') {
    const quantity = Number(data.quantity);
    const purchasePrice = Number(data.purchasePrice);

    if (!quantity || quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }
    if (isNaN(purchasePrice) || purchasePrice < 0) {
      throw new BadRequestException('Purchase price must be zero or greater');
    }
    if (!data.productId) {
      throw new BadRequestException('Product must be selected');
    }
    if (!data.variantSku) {
      throw new BadRequestException('Variant SKU must be specified');
    }

    const product = await this.productModel.findById(data.productId).exec();
    if (!product) {
      throw new NotFoundException('Selected product not found');
    }

    const variantIndex = product.variants.findIndex((v) => v.sku === data.variantSku);
    if (variantIndex === -1) {
      throw new NotFoundException(`Variant with SKU "${data.variantSku}" not found in product`);
    }

    const variant = product.variants[variantIndex];

    // Manual cost fields per investment
    const boxCost = Math.max(0, Number(data.boxCost) || 0);
    const transportCost = Math.max(0, Number(data.transportCost) || 0);
    const polyCost = Math.max(0, Number(data.polyCost) || 0);
    const stickerCost = Math.max(0, Number(data.stickerCost) || 0);
    const tagCost = Math.max(0, Number(data.tagCost) || 0);
    const otherCost = Math.max(0, Number(data.otherCost) || 0);

    const additionalCostPerUnit =
      boxCost + transportCost + polyCost + stickerCost + tagCost + otherCost;
    const actualCostPerUnit = purchasePrice + additionalCostPerUnit;
    const totalInvestment = actualCostPerUnit * quantity;

    const investmentId =
      data.investmentId ||
      `INV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    // Weighted Average Cost calculation
    const oldQty = variant.stockQuantity || 0;
    const oldCost = variant.weightedAverageCost || variant.costPrice || actualCostPerUnit;
    const newQty = oldQty + quantity;
    const newWAC =
      newQty > 0
        ? Math.round((oldQty * oldCost + quantity * actualCostPerUnit) / newQty)
        : actualCostPerUnit;

    variant.stockQuantity = newQty;
    variant.weightedAverageCost = newWAC;
    variant.costPrice = actualCostPerUnit;

    product.markModified('variants');
    await product.save();

    // Immutable Inventory Transaction
    await this.transactionModel.create({
      productId: (product as any)._id,
      variantSku: variant.sku,
      previousQuantity: oldQty,
      quantityChange: quantity,
      newQuantity: newQty,
      transactionType: InventoryTransactionType.RESTOCK,
      note: `Product Investment #${investmentId} (${product.name} - ${variant.sku}) ${quantity} units @ Actual Cost ৳${actualCostPerUnit}/unit (Purchase: ৳${purchasePrice} + Direct Pack/Ship: ৳${additionalCostPerUnit})`,
    });

    const investment = await this.productInvestmentModel.create({
      investmentId,
      date: data.date ? new Date(data.date) : new Date(),
      productId: (product as any)._id,
      productName: product.name,
      variantSku: variant.sku,
      variantDetails: `${variant.color || ''} ${variant.size || ''}`.trim() || variant.sku,
      quantity,
      purchasePrice,
      boxCost,
      transportCost,
      polyCost,
      stickerCost,
      tagCost,
      otherCost,
      additionalCostPerUnit,
      actualCostPerUnit,
      totalInvestment,
      remainingStock: newQty,
      paymentAccount: data.paymentAccount || 'Bank',
      notes: data.notes || '',
      recordedBy: actor,
      auditHistory: [
        {
          changedBy: actor,
          date: new Date(),
          fieldChanged: 'CREATED',
          previousValue: 'None',
          newValue: `Qty: ${quantity}, Actual Cost: ৳${actualCostPerUnit}, Total: ৳${totalInvestment}`,
          reason: 'Initial Product Purchase Investment Entry',
        },
      ],
    });

    await this.auditLogService.logAction({
      action: 'PRODUCT_INVESTMENT_RECORDED',
      entityType: 'ProductInvestment',
      entityId: (investment as any)._id.toString(),
      newData: {
        investmentId,
        productName: product.name,
        variantSku: variant.sku,
        quantity,
        actualCostPerUnit,
        totalInvestment,
        actor,
      },
    });

    return investment;
  }

  async updateProductInvestment(id: string, data: any, actor: string = 'ADMIN') {
    const investment = await this.productInvestmentModel.findById(id).exec();
    if (!investment) {
      throw new NotFoundException('Product investment record not found');
    }

    const reason = data.reason || 'Admin financial record correction';
    const auditEntries: any[] = [];

    const newQty = Number(data.quantity);
    const newPurchasePrice = Number(data.purchasePrice);
    const newBoxCost = Math.max(0, Number(data.boxCost ?? investment.boxCost));
    const newTransportCost = Math.max(0, Number(data.transportCost ?? investment.transportCost));
    const newPolyCost = Math.max(0, Number(data.polyCost ?? investment.polyCost));
    const newStickerCost = Math.max(0, Number(data.stickerCost ?? investment.stickerCost));
    const newTagCost = Math.max(0, Number(data.tagCost ?? investment.tagCost));
    const newOtherCost = Math.max(0, Number(data.otherCost ?? investment.otherCost));

    const newAddCost =
      newBoxCost + newTransportCost + newPolyCost + newStickerCost + newTagCost + newOtherCost;
    const newActualCost = newPurchasePrice + newAddCost;
    const newTotalInvestment = newActualCost * newQty;

    // Track field-by-field audit changes
    if (investment.quantity !== newQty) {
      auditEntries.push({
        changedBy: actor,
        date: new Date(),
        fieldChanged: 'Quantity',
        previousValue: `${investment.quantity} pcs`,
        newValue: `${newQty} pcs`,
        reason,
      });
    }

    if (investment.purchasePrice !== newPurchasePrice) {
      auditEntries.push({
        changedBy: actor,
        date: new Date(),
        fieldChanged: 'Purchase Price',
        previousValue: `৳${investment.purchasePrice}`,
        newValue: `৳${newPurchasePrice}`,
        reason,
      });
    }

    if (investment.actualCostPerUnit !== newActualCost) {
      auditEntries.push({
        changedBy: actor,
        date: new Date(),
        fieldChanged: 'Actual Cost / Unit',
        previousValue: `৳${investment.actualCostPerUnit}`,
        newValue: `৳${newActualCost}`,
        reason,
      });
    }

    // Adjust product inventory stock difference safely if quantity changed
    const qtyDelta = newQty - investment.quantity;
    const product = await this.productModel.findById(investment.productId).exec();
    if (product) {
      const vIndex = product.variants.findIndex((v) => v.sku === investment.variantSku);
      if (vIndex !== -1) {
        const variant = product.variants[vIndex];
        const oldStock = variant.stockQuantity || 0;
        const updatedStock = Math.max(0, oldStock + qtyDelta);
        variant.stockQuantity = updatedStock;

        // Recalculate WAC if cost or quantity changed
        if (updatedStock > 0 && (newActualCost !== investment.actualCostPerUnit || qtyDelta !== 0)) {
          const oldTotalCost = oldStock * (variant.weightedAverageCost || investment.actualCostPerUnit);
          const adjustedTotalCost = oldTotalCost + (newQty * newActualCost - investment.quantity * investment.actualCostPerUnit);
          variant.weightedAverageCost = Math.round(Math.max(1, adjustedTotalCost / updatedStock));
          variant.costPrice = newActualCost;
        }

        product.markModified('variants');
        await product.save();

        if (qtyDelta !== 0) {
          await this.transactionModel.create({
            productId: (product as any)._id,
            variantSku: variant.sku,
            previousQuantity: oldStock,
            quantityChange: qtyDelta,
            newQuantity: updatedStock,
            transactionType: InventoryTransactionType.MANUAL_ADJUSTMENT,
            note: `Correction on Investment #${investment.investmentId}: ${reason}`,
          });
        }
      }
    }

    investment.quantity = newQty;
    investment.purchasePrice = newPurchasePrice;
    investment.boxCost = newBoxCost;
    investment.transportCost = newTransportCost;
    investment.polyCost = newPolyCost;
    investment.stickerCost = newStickerCost;
    investment.tagCost = newTagCost;
    investment.otherCost = newOtherCost;
    investment.additionalCostPerUnit = newAddCost;
    investment.actualCostPerUnit = newActualCost;
    investment.totalInvestment = newTotalInvestment;
    if (data.notes !== undefined) investment.notes = data.notes;
    if (data.paymentAccount) investment.paymentAccount = data.paymentAccount;

    if (auditEntries.length > 0) {
      investment.auditHistory.push(...auditEntries);
    }

    await investment.save();

    await this.auditLogService.logAction({
      action: 'PRODUCT_INVESTMENT_CORRECTED',
      entityType: 'ProductInvestment',
      entityId: (investment as any)._id.toString(),
      newData: {
        investmentId: investment.investmentId,
        newQty,
        newActualCost,
        newTotalInvestment,
        reason,
        actor,
      },
    });

    return investment;
  }

  async deleteProductInvestment(id: string, actor: string = 'ADMIN') {
    const investment = await this.productInvestmentModel.findById(id).exec();
    if (!investment) {
      throw new NotFoundException('Investment record not found');
    }

    // Reverse added stock safely
    const product = await this.productModel.findById(investment.productId).exec();
    if (product) {
      const vIndex = product.variants.findIndex((v) => v.sku === investment.variantSku);
      if (vIndex !== -1) {
        const variant = product.variants[vIndex];
        const oldStock = variant.stockQuantity || 0;
        variant.stockQuantity = Math.max(0, oldStock - investment.quantity);
        product.markModified('variants');
        await product.save();

        await this.transactionModel.create({
          productId: (product as any)._id,
          variantSku: variant.sku,
          previousQuantity: oldStock,
          quantityChange: -investment.quantity,
          newQuantity: variant.stockQuantity,
          transactionType: InventoryTransactionType.MANUAL_ADJUSTMENT,
          note: `Reversal on Deleted Investment #${investment.investmentId} by ${actor}`,
        });
      }
    }

    await this.productInvestmentModel.findByIdAndDelete(id).exec();

    await this.auditLogService.logAction({
      action: 'PRODUCT_INVESTMENT_DELETED',
      entityType: 'ProductInvestment',
      entityId: id,
      newData: {
        investmentId: investment.investmentId,
        actor,
      },
    });

    return { success: true };
  }

  // ================= DAMAGE & LOST STOCK ADJUSTMENT =================

  async adjustDamagedOrLostStock(
    payload: {
      productId: string;
      variantSku: string;
      quantity: number;
      reason: 'DAMAGED' | 'LOST' | 'EXPIRED' | 'INVENTORY_DISCREPANCY';
      notes?: string;
    },
    actor: string = 'ADMIN',
  ) {
    const qty = Math.abs(Number(payload.quantity));
    if (!qty || qty <= 0) {
      throw new BadRequestException('Adjustment quantity must be greater than zero');
    }

    const product = await this.productModel.findById(payload.productId).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const vIndex = product.variants.findIndex((v) => v.sku === payload.variantSku);
    if (vIndex === -1) {
      throw new NotFoundException(`Variant SKU "${payload.variantSku}" not found`);
    }

    const variant = product.variants[vIndex];
    const currentStock = variant.stockQuantity || 0;

    if (currentStock < qty) {
      throw new BadRequestException(
        `Cannot write off ${qty} units. Current stock is only ${currentStock} units.`,
      );
    }

    const unitCost = variant.weightedAverageCost || variant.costPrice || 0;
    const lossAmount = qty * unitCost;
    const newStock = Math.max(0, currentStock - qty);

    variant.stockQuantity = newStock;
    product.markModified('variants');
    await product.save();

    const txType =
      payload.reason === 'DAMAGED'
        ? InventoryTransactionType.DAMAGE
        : InventoryTransactionType.MANUAL_ADJUSTMENT;

    await this.transactionModel.create({
      productId: (product as any)._id,
      variantSku: variant.sku,
      previousQuantity: currentStock,
      quantityChange: -qty,
      newQuantity: newStock,
      transactionType: txType,
      note: `[${payload.reason}] Loss of ৳${lossAmount} (${qty} units @ ৳${unitCost}/unit): ${payload.notes || ''}`,
    });

    await this.auditLogService.logAction({
      action: 'STOCK_LOSS_ADJUSTMENT',
      entityType: 'Product',
      entityId: (product as any)._id.toString(),
      newData: {
        sku: variant.sku,
        reason: payload.reason,
        writtenOffUnits: qty,
        lossAmount,
        remainingStock: newStock,
        actor,
      },
    });

    return {
      success: true,
      productId: product._id,
      variantSku: variant.sku,
      writtenOffQuantity: qty,
      unitCost,
      lossAmount,
      remainingStock: newStock,
      reason: payload.reason,
    };
  }

  // ================= CSV EXPORT FOR INVESTMENT REPORT =================

  async exportProductInvestmentsCsv(query: { from?: string; to?: string; search?: string }) {
    const list = await this.getProductInvestments(query);

    const headers = [
      'Investment ID',
      'Date',
      'Product Name',
      'SKU',
      'Variant',
      'Quantity',
      'Purchase Price (BDT)',
      'Box Cost',
      'Transport Cost',
      'Poly Cost',
      'Sticker Cost',
      'Tag Cost',
      'Other Cost',
      'Additional Cost / Unit',
      'Actual Cost / Unit',
      'Total Investment (BDT)',
      'Current Stock',
      'Recorded By',
    ];

    const rows = list.map((inv: any) => [
      `"${inv.investmentId}"`,
      `"${new Date(inv.date).toISOString().slice(0, 10)}"`,
      `"${inv.productName.replace(/"/g, '""')}"`,
      `"${inv.variantSku}"`,
      `"${(inv.variantDetails || '').replace(/"/g, '""')}"`,
      inv.quantity,
      inv.purchasePrice,
      inv.boxCost || 0,
      inv.transportCost || 0,
      inv.polyCost || 0,
      inv.stickerCost || 0,
      inv.tagCost || 0,
      inv.otherCost || 0,
      inv.additionalCostPerUnit,
      inv.actualCostPerUnit,
      inv.totalInvestment,
      inv.liveStock ?? 0,
      `"${inv.recordedBy || 'ADMIN'}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
