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
exports.CapitalService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const capital_schema_1 = require("../../schemas/capital.schema");
const product_investment_schema_1 = require("../../schemas/product-investment.schema");
const product_schema_1 = require("../../schemas/product.schema");
const inventory_transaction_schema_1 = require("../../schemas/inventory-transaction.schema");
const category_schema_1 = require("../../schemas/category.schema");
const audit_log_service_1 = require("../audit-log/audit-log.service");
let CapitalService = class CapitalService {
    constructor(capitalModel, productInvestmentModel, productModel, transactionModel, categoryModel, auditLogService) {
        this.capitalModel = capitalModel;
        this.productInvestmentModel = productInvestmentModel;
        this.productModel = productModel;
        this.transactionModel = transactionModel;
        this.categoryModel = categoryModel;
        this.auditLogService = auditLogService;
    }
    async getTransactions(query) {
        const filter = {};
        if (query.type)
            filter.type = query.type;
        const limit = Math.max(1, Math.min(200, Number(query.limit) || 100));
        return this.capitalModel.find(filter).sort({ date: -1, createdAt: -1 }).limit(limit).exec();
    }
    async createTransaction(data, actor = 'ADMIN') {
        const amount = Number(data.amount) || 0;
        if (amount <= 0) {
            throw new common_1.BadRequestException('Amount must be greater than zero');
        }
        const tx = await this.capitalModel.create({
            type: data.type || capital_schema_1.CapitalTransactionType.OWNER_CAPITAL_IN,
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
            entityId: tx._id.toString(),
            newData: {
                type: tx.type,
                amount: tx.amount,
                source: tx.source,
                actor,
            },
        });
        return tx;
    }
    async deleteTransaction(id, actor = 'ADMIN') {
        const tx = await this.capitalModel.findByIdAndDelete(id).exec();
        if (!tx)
            throw new common_1.NotFoundException('Capital transaction not found');
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
            if (tx.type === capital_schema_1.CapitalTransactionType.OWNER_CAPITAL_IN) {
                totalCapitalIn += tx.amount || 0;
            }
            else if (tx.type === capital_schema_1.CapitalTransactionType.OWNER_WITHDRAWAL) {
                totalWithdrawals += tx.amount || 0;
            }
            else if (tx.type === capital_schema_1.CapitalTransactionType.LOAN_IN) {
                totalLoansIn += tx.amount || 0;
            }
            else if (tx.type === capital_schema_1.CapitalTransactionType.LOAN_REPAYMENT) {
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
    async getProductInvestments(query) {
        const filter = {};
        if (query.productId && mongoose_2.Types.ObjectId.isValid(query.productId)) {
            filter.productId = new mongoose_2.Types.ObjectId(query.productId);
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
        const enriched = await Promise.all(investments.map(async (inv) => {
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
        }));
        return enriched;
    }
    async getInvestmentProductsSummary() {
        const [products, investments] = await Promise.all([
            this.productModel.find({}).sort({ createdAt: -1 }).exec(),
            this.productInvestmentModel.find({}).exec(),
        ]);
        const investmentMap = new Map();
        for (const inv of investments) {
            const key = inv.productId?.toString();
            if (!key)
                continue;
            const existing = investmentMap.get(key) || { count: 0, totalUnits: 0, totalCost: 0, lastDate: inv.date };
            existing.count += 1;
            existing.totalUnits += inv.quantity || 0;
            existing.totalCost += inv.totalInvestment || 0;
            if (inv.date > existing.lastDate)
                existing.lastDate = inv.date;
            investmentMap.set(key, existing);
        }
        return products.map((p) => {
            const invInfo = investmentMap.get(p._id.toString());
            const totalStock = p.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) || 0;
            const primaryVariant = p.variants?.[0];
            const wac = primaryVariant?.weightedAverageCost || primaryVariant?.costPrice || 0;
            return {
                _id: p._id,
                name: p.name,
                slug: p.slug,
                status: p.status,
                isPublished: p.isPublished,
                hasInvestment: Boolean(invInfo && invInfo.count > 0),
                investmentCount: invInfo?.count || 0,
                totalInvestedUnits: invInfo?.totalUnits || 0,
                totalInvestedCost: invInfo?.totalCost || 0,
                totalStock,
                currentWac: wac,
                variants: p.variants || [],
                images: p.images || [],
                salePrice: p.salePrice || 0,
                originalPrice: p.originalPrice || 0,
                createdAt: p.createdAt,
            };
        });
    }
    async autoDetectCategoryId(nameOrText) {
        const text = (nameOrText || '').toLowerCase();
        if (!text || !this.categoryModel)
            return null;
        if (text.includes('hair') ||
            text.includes('clip') ||
            text.includes('pin') ||
            text.includes('headband') ||
            text.includes('হেয়ার') ||
            text.includes('হেয়ার') ||
            text.includes('ক্লিপ') ||
            text.includes('কাটা') ||
            text.includes('scrunchie')) {
            const cat = await this.categoryModel.findOne({ slug: 'women-hair-accessories' }).exec();
            return cat?._id || null;
        }
        if (text.includes('চুড়ি') ||
            text.includes('চুড়ি') ||
            text.includes('churi') ||
            text.includes('curi') ||
            text.includes('bangle') ||
            text.includes('reshmi') ||
            text.includes('resmi') ||
            text.includes('kasmeri') ||
            text.includes('kashmiri') ||
            text.includes('kacer') ||
            text.includes('kacher') ||
            text.includes('কাঁচের') ||
            text.includes('bala') ||
            text.includes('বালা') ||
            text.includes('কঙ্কন')) {
            const cat = await this.categoryModel.findOne({ slug: 'women-churi-bangles' }).exec();
            return cat?._id || null;
        }
        if (text.includes('hijab') ||
            text.includes('হিজাব') ||
            text.includes('abaya') ||
            text.includes('scarf') ||
            text.includes('জাপান') ||
            text.includes('জাপ্রান') ||
            text.includes('popcorn') ||
            text.includes('cherry') ||
            text.includes('ceri')) {
            const cat = await this.categoryModel.findOne({ slug: 'women-hijab' }).exec();
            return cat?._id || null;
        }
        if (text.includes('jhumka') ||
            text.includes('ঝুমকা') ||
            text.includes('kundan') ||
            text.includes('jewel') ||
            text.includes('গহনা') ||
            text.includes('necklace') ||
            text.includes('earring') ||
            text.includes('choker') ||
            text.includes('payel') ||
            text.includes('পায়েল') ||
            text.includes('নূপুর')) {
            const cat = await this.categoryModel.findOne({ slug: 'women-accessories' }).exec();
            return cat?._id || null;
        }
        if (text.includes('panjabi') || text.includes('পাঞ্জাবি') || text.includes('punjabi')) {
            const cat = await this.categoryModel.findOne({ slug: 'men-clothing' }).exec();
            return cat?._id || null;
        }
        if (text.includes('loafer') || text.includes('লোফার') || text.includes('men')) {
            const cat = await this.categoryModel.findOne({ slug: 'men-shoes' }).exec();
            return cat?._id || null;
        }
        if (text.includes('nagra') || text.includes('নাগরা') || text.includes('জুতা') || text.includes('heel')) {
            const cat = await this.categoryModel.findOne({ slug: 'women-shoes' }).exec();
            return cat?._id || null;
        }
        if (text.includes('dress') || text.includes('gown') || text.includes('kurti') || text.includes('গাউন') || text.includes('ড্রেস')) {
            const cat = await this.categoryModel.findOne({ slug: 'women-dresses' }).exec();
            return cat?._id || null;
        }
        return null;
    }
    async createProductInvestment(data, actor = 'ADMIN') {
        const quantity = Number(data.quantity);
        const purchasePrice = Number(data.purchasePrice);
        if (!quantity || quantity <= 0) {
            throw new common_1.BadRequestException('Quantity must be greater than zero');
        }
        if (isNaN(purchasePrice) || purchasePrice < 0) {
            throw new common_1.BadRequestException('Purchase price must be zero or greater');
        }
        const boxCost = Math.max(0, Number(data.boxCost) || 0);
        const transportCost = Math.max(0, Number(data.transportCost) || 0);
        const polyCost = Math.max(0, Number(data.polyCost) || 0);
        const stickerCost = Math.max(0, Number(data.stickerCost) || 0);
        const tagCost = Math.max(0, Number(data.tagCost) || 0);
        const otherCost = Math.max(0, Number(data.otherCost) || 0);
        const additionalCostPerUnit = boxCost + transportCost + polyCost + stickerCost + tagCost + otherCost;
        const actualCostPerUnit = purchasePrice + additionalCostPerUnit;
        const totalInvestment = actualCostPerUnit * quantity;
        const investmentId = data.investmentId ||
            `INV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
        let product = null;
        let variantSku = (data.variantSku || '').trim();
        if (data.productId && mongoose_2.Types.ObjectId.isValid(data.productId) && !data.isNewProduct) {
            product = await this.productModel.findById(data.productId).exec();
            if (!product) {
                throw new common_1.NotFoundException('Selected product not found');
            }
        }
        else if (data.productName && data.productName.trim()) {
            const cleanName = data.productName.trim();
            if (!data.forceNewProduct) {
                product = await this.productModel.findOne({
                    name: { $regex: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
                }).exec();
            }
            if (!product) {
                const cleanSlug = cleanName
                    .toLowerCase()
                    .replace(/[^a-z0-9\u0980-\u09FF]+/g, '-')
                    .replace(/(^-|-$)+/g, '');
                const autoSlug = cleanSlug ? `${cleanSlug}-${Date.now().toString().slice(-4)}` : `prod-${Date.now().toString().slice(-6)}`;
                const detectedCatId = await this.autoDetectCategoryId(cleanName);
                if (!variantSku) {
                    variantSku = `AVE-${Date.now().toString().slice(-5)}`;
                }
                const initialVariant = {
                    sku: variantSku,
                    color: data.variantColor || data.variantDetails || 'Standard',
                    colorHex: data.variantColorHex || '#C5A059',
                    size: data.variantSize || 'Standard',
                    price: 0,
                    costPrice: actualCostPerUnit,
                    weightedAverageCost: actualCostPerUnit,
                    stockQuantity: 0,
                    reservedQuantity: 0,
                };
                product = await this.productModel.create({
                    name: cleanName,
                    slug: autoSlug,
                    categoryId: detectedCatId || undefined,
                    description: data.description || '',
                    images: data.image ? [data.image] : [],
                    originalPrice: 0,
                    salePrice: 0,
                    isPublished: false,
                    status: 'DRAFT',
                    dataMode: data.dataMode || 'PRODUCTION',
                    variants: [initialVariant],
                });
            }
        }
        else {
            throw new common_1.BadRequestException('Product must be selected or a Product Name provided');
        }
        if (!variantSku) {
            variantSku = product.variants?.[0]?.sku || `AVE-${Date.now().toString().slice(-5)}`;
        }
        let variantIndex = product.variants.findIndex((v) => v.sku === variantSku);
        let oldQty = 0;
        let oldCost = actualCostPerUnit;
        if (variantIndex === -1) {
            const newVariant = {
                sku: variantSku,
                color: data.variantColor || data.variantDetails || 'Standard',
                colorHex: data.variantColorHex || '#C5A059',
                size: data.variantSize || 'Standard',
                price: product.salePrice || 0,
                costPrice: actualCostPerUnit,
                weightedAverageCost: actualCostPerUnit,
                stockQuantity: quantity,
                reservedQuantity: 0,
            };
            product.variants.push(newVariant);
            variantIndex = product.variants.length - 1;
        }
        else {
            const variant = product.variants[variantIndex];
            oldQty = variant.stockQuantity || 0;
            oldCost = variant.weightedAverageCost || variant.costPrice || actualCostPerUnit;
            const newQty = oldQty + quantity;
            const newWAC = newQty > 0
                ? Math.round((oldQty * oldCost + quantity * actualCostPerUnit) / newQty)
                : actualCostPerUnit;
            variant.stockQuantity = newQty;
            variant.weightedAverageCost = newWAC;
            variant.costPrice = actualCostPerUnit;
        }
        product.markModified('variants');
        await product.save();
        const variant = product.variants[variantIndex];
        const newQty = variant.stockQuantity;
        await this.transactionModel.create({
            productId: product._id,
            variantSku: variant.sku,
            previousQuantity: oldQty,
            quantityChange: quantity,
            newQuantity: newQty,
            transactionType: inventory_transaction_schema_1.InventoryTransactionType.RESTOCK,
            note: `Product Investment #${investmentId} (${product.name} - ${variant.sku}) ${quantity} units @ Actual Cost ৳${actualCostPerUnit}/unit (Purchase: ৳${purchasePrice} + Direct Pack/Ship: ৳${additionalCostPerUnit})`,
        });
        const investment = await this.productInvestmentModel.create({
            investmentId,
            date: data.date ? new Date(data.date) : new Date(),
            productId: product._id,
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
            entityId: investment._id.toString(),
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
    async updateProductInvestment(id, data, actor = 'ADMIN') {
        const investment = await this.productInvestmentModel.findById(id).exec();
        if (!investment) {
            throw new common_1.NotFoundException('Product investment record not found');
        }
        const reason = data.reason || 'Admin financial record correction';
        const auditEntries = [];
        const newQty = Number(data.quantity);
        const newPurchasePrice = Number(data.purchasePrice);
        const newBoxCost = Math.max(0, Number(data.boxCost ?? investment.boxCost));
        const newTransportCost = Math.max(0, Number(data.transportCost ?? investment.transportCost));
        const newPolyCost = Math.max(0, Number(data.polyCost ?? investment.polyCost));
        const newStickerCost = Math.max(0, Number(data.stickerCost ?? investment.stickerCost));
        const newTagCost = Math.max(0, Number(data.tagCost ?? investment.tagCost));
        const newOtherCost = Math.max(0, Number(data.otherCost ?? investment.otherCost));
        const newAddCost = newBoxCost + newTransportCost + newPolyCost + newStickerCost + newTagCost + newOtherCost;
        const newActualCost = newPurchasePrice + newAddCost;
        const newTotalInvestment = newActualCost * newQty;
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
        const qtyDelta = newQty - investment.quantity;
        const product = await this.productModel.findById(investment.productId).exec();
        if (product) {
            const vIndex = product.variants.findIndex((v) => v.sku === investment.variantSku);
            if (vIndex !== -1) {
                const variant = product.variants[vIndex];
                const oldStock = variant.stockQuantity || 0;
                const updatedStock = Math.max(0, oldStock + qtyDelta);
                variant.stockQuantity = updatedStock;
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
                        productId: product._id,
                        variantSku: variant.sku,
                        previousQuantity: oldStock,
                        quantityChange: qtyDelta,
                        newQuantity: updatedStock,
                        transactionType: inventory_transaction_schema_1.InventoryTransactionType.MANUAL_ADJUSTMENT,
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
        if (data.notes !== undefined)
            investment.notes = data.notes;
        if (data.paymentAccount)
            investment.paymentAccount = data.paymentAccount;
        if (auditEntries.length > 0) {
            investment.auditHistory.push(...auditEntries);
        }
        await investment.save();
        await this.auditLogService.logAction({
            action: 'PRODUCT_INVESTMENT_CORRECTED',
            entityType: 'ProductInvestment',
            entityId: investment._id.toString(),
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
    async deleteProductInvestment(id, actor = 'ADMIN') {
        const investment = await this.productInvestmentModel.findById(id).exec();
        if (!investment) {
            throw new common_1.NotFoundException('Investment record not found');
        }
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
                    productId: product._id,
                    variantSku: variant.sku,
                    previousQuantity: oldStock,
                    quantityChange: -investment.quantity,
                    newQuantity: variant.stockQuantity,
                    transactionType: inventory_transaction_schema_1.InventoryTransactionType.MANUAL_ADJUSTMENT,
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
    async adjustDamagedOrLostStock(payload, actor = 'ADMIN') {
        const qty = Math.abs(Number(payload.quantity));
        if (!qty || qty <= 0) {
            throw new common_1.BadRequestException('Adjustment quantity must be greater than zero');
        }
        const product = await this.productModel.findById(payload.productId).exec();
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const vIndex = product.variants.findIndex((v) => v.sku === payload.variantSku);
        if (vIndex === -1) {
            throw new common_1.NotFoundException(`Variant SKU "${payload.variantSku}" not found`);
        }
        const variant = product.variants[vIndex];
        const currentStock = variant.stockQuantity || 0;
        if (currentStock < qty) {
            throw new common_1.BadRequestException(`Cannot write off ${qty} units. Current stock is only ${currentStock} units.`);
        }
        const unitCost = variant.weightedAverageCost || variant.costPrice || 0;
        const lossAmount = qty * unitCost;
        const newStock = Math.max(0, currentStock - qty);
        variant.stockQuantity = newStock;
        product.markModified('variants');
        await product.save();
        const txType = payload.reason === 'DAMAGED'
            ? inventory_transaction_schema_1.InventoryTransactionType.DAMAGE
            : inventory_transaction_schema_1.InventoryTransactionType.MANUAL_ADJUSTMENT;
        await this.transactionModel.create({
            productId: product._id,
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
            entityId: product._id.toString(),
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
    async exportProductInvestmentsCsv(query) {
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
        const rows = list.map((inv) => [
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
};
exports.CapitalService = CapitalService;
exports.CapitalService = CapitalService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(capital_schema_1.CapitalTransaction.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_investment_schema_1.ProductInvestment.name)),
    __param(2, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(3, (0, mongoose_1.InjectModel)(inventory_transaction_schema_1.InventoryTransaction.name)),
    __param(4, (0, mongoose_1.InjectModel)(category_schema_1.Category.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        audit_log_service_1.AuditLogService])
], CapitalService);
//# sourceMappingURL=capital.service.js.map