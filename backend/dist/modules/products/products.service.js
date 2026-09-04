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
exports.ProductsService = exports.DEFAULT_AVELORA_CATEGORIES = void 0;
exports.evaluateProductPricing = evaluateProductPricing;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const product_schema_1 = require("../../schemas/product.schema");
const category_schema_1 = require("../../schemas/category.schema");
exports.DEFAULT_AVELORA_CATEGORIES = [
    { slug: 'women-hijab', name: 'Hijab Collection (হিজাব)', department: 'women', description: 'Turkish Silk Georgette, Chiffon, Satin & Premium Abaya wraps' },
    { slug: 'women-churi-bangles', name: 'Churi & Bangles (কাঁচের ও রেশমি চুড়ি)', department: 'women', description: 'ঐতিহ্যবাহী কাঁচের চুড়ি, রেশমি ভেলভেট চুড়ি ও কঙ্কন সেট' },
    { slug: 'women-accessories', name: 'Accessories & Fine Jewellery (জুয়েলারি ও গহনা)', department: 'women', description: '18K gold-plated jhumkas, Kundan choker necklaces, and payel sets' },
    { slug: 'women-dresses', name: 'Dresses & Modest Wear (ড্রেস ও গাউন)', department: 'women', description: 'Designer festive kurtis, kaftans, and luxury festive gowns' },
    { slug: 'women-hair-accessories', name: 'Hair Accessories (হেয়ার এক্সেসরিজ)', department: 'women', description: 'Pearl hairpins, claw clips, and velvet headband accessories' },
    { slug: 'women-shoes', name: 'Shoes & Footwear (জুতা ও নাগরা)', department: 'women', description: 'Embroidered velvet nagras, embellished juttis, and block heels' },
    { slug: 'men-shoes', name: 'Shoes & Loafers (মেনস জুতা ও লোফার)', department: 'men', description: 'Italian leather penny loafers, formal oxfords, and nagras' },
    { slug: 'men-clothing', name: 'Clothing & Panjabi (মেনস পাঞ্জাবি)', department: 'men', description: 'Festive silk and fine cotton embroidered panjabis' },
    { slug: 'kids-girls-dresses', name: 'Girls\' Dresses (বাচ্চাদের ড্রেস ও পার্টি গাউন)', department: 'kids', description: 'Organza party gowns and velvet Eid frocks for little princesses' },
    { slug: 'kids-accessories', name: 'Kids\' Shoes & Accessories (বাচ্চাদের জুতা ও এক্সেসরিজ)', department: 'kids', description: 'Kids footwear, headbands, and accessories' },
];
function evaluateProductPricing(product, now = new Date()) {
    const originalPrice = Math.max(0, Number(product.originalPrice) || 0);
    let salePrice = Math.max(0, Number(product.salePrice) || 0);
    if ((!salePrice || salePrice === originalPrice) && product.discountPercentage && product.discountPercentage > 0 && originalPrice > 0) {
        salePrice = Math.round(originalPrice * (1 - product.discountPercentage / 100));
    }
    const isEnabled = product.isDiscountActive !== false;
    let isFuture = false;
    let isExpired = false;
    if (product.discountStartDate) {
        const start = new Date(product.discountStartDate);
        if (!isNaN(start.getTime()) && now.getTime() < start.getTime()) {
            isFuture = true;
        }
    }
    if (product.discountEndDate) {
        const end = new Date(product.discountEndDate);
        if (!isNaN(end.getTime()) && now.getTime() > end.getTime()) {
            isExpired = true;
        }
    }
    const isTimeValid = !isFuture && !isExpired;
    const isDiscountValid = isEnabled && isTimeValid && salePrice > 0 && salePrice < originalPrice;
    if (isDiscountValid) {
        const savingAmount = originalPrice - salePrice;
        const discountPercentage = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
        return {
            regularPrice: originalPrice,
            salePrice,
            effectivePrice: salePrice,
            hasDiscount: true,
            discountPercentage,
            savingAmount,
            isDiscountActive: true,
            isScheduled: Boolean(product.discountStartDate || product.discountEndDate),
            isExpired: false,
            isFuture: false,
        };
    }
    const fallbackPrice = originalPrice > 0 ? originalPrice : salePrice;
    return {
        regularPrice: fallbackPrice,
        salePrice: 0,
        effectivePrice: fallbackPrice,
        hasDiscount: false,
        discountPercentage: 0,
        savingAmount: 0,
        isDiscountActive: false,
        isScheduled: Boolean(product.discountStartDate || product.discountEndDate),
        isExpired,
        isFuture,
    };
}
const order_schema_1 = require("../../schemas/order.schema");
const purchase_schema_1 = require("../../schemas/purchase.schema");
const inventory_transaction_schema_1 = require("../../schemas/inventory-transaction.schema");
const return_request_schema_1 = require("../../schemas/return-request.schema");
const audit_log_service_1 = require("../audit-log/audit-log.service");
let ProductsService = class ProductsService {
    constructor(productModel, categoryModel, orderModel, purchaseOrderModel, transactionModel, returnRequestModel, auditLogService) {
        this.productModel = productModel;
        this.categoryModel = categoryModel;
        this.orderModel = orderModel;
        this.purchaseOrderModel = purchaseOrderModel;
        this.transactionModel = transactionModel;
        this.returnRequestModel = returnRequestModel;
        this.auditLogService = auditLogService;
    }
    normalizeProductImages(payload) {
        if (Array.isArray(payload.productImages) && payload.productImages.length > 0) {
            let hasPrimary = false;
            const normalized = payload.productImages.map((img, idx) => {
                const url = typeof img === 'string' ? img.trim() : (img.url?.trim() || '');
                const isPrimary = typeof img === 'object' && Boolean(img.isPrimary);
                if (isPrimary)
                    hasPrimary = true;
                return {
                    url,
                    public_id: typeof img === 'object' ? img.public_id || '' : '',
                    sortOrder: typeof img === 'object' && img.sortOrder !== undefined ? Number(img.sortOrder) : idx,
                    isPrimary,
                    alt: typeof img === 'object' ? img.alt || '' : '',
                    width: typeof img === 'object' ? Number(img.width) || 0 : 0,
                    height: typeof img === 'object' ? Number(img.height) || 0 : 0,
                    variantColor: typeof img === 'object' ? img.variantColor || '' : '',
                };
            }).filter((img) => Boolean(img.url));
            if (!hasPrimary && normalized.length > 0) {
                normalized[0].isPrimary = true;
            }
            normalized.sort((a, b) => (a.isPrimary ? -1 : b.isPrimary ? 1 : a.sortOrder - b.sortOrder));
            normalized.forEach((img, idx) => {
                img.sortOrder = idx;
            });
            payload.productImages = normalized;
            payload.images = normalized.map((img) => img.url);
        }
        else if (Array.isArray(payload.images) && payload.images.length > 0) {
            const cleanImages = payload.images.map((img) => String(img).trim()).filter(Boolean);
            payload.images = cleanImages;
            payload.productImages = cleanImages.map((url, idx) => ({
                url,
                public_id: '',
                sortOrder: idx,
                isPrimary: idx === 0,
                alt: '',
                width: 0,
                height: 0,
                variantColor: '',
            }));
        }
    }
    validatePricingAndDates(payload) {
        const orig = Number(payload.originalPrice) || 0;
        const sale = Number(payload.salePrice) || 0;
        if (payload.isDiscountActive !== false && sale > 0 && orig > 0) {
            if (sale >= orig) {
                throw new common_1.BadRequestException(`Sale price (৳${sale}) must be strictly less than original price (৳${orig})`);
            }
        }
        if (payload.discountStartDate && payload.discountEndDate) {
            const start = new Date(payload.discountStartDate);
            const end = new Date(payload.discountEndDate);
            if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end.getTime() <= start.getTime()) {
                throw new common_1.BadRequestException('Discount end date must be strictly after start date');
            }
        }
        if (orig > 0 && sale > 0 && sale < orig) {
            payload.discountPercentage = Math.round(((orig - sale) / orig) * 100);
        }
        else if (payload.discountPercentage > 0 && orig > 0 && (!sale || sale === orig)) {
            payload.salePrice = Math.round(orig * (1 - payload.discountPercentage / 100));
        }
    }
    async findPublic(query) {
        const filter = {
            isPublished: { $ne: false },
            status: 'ACTIVE',
            dataMode: { $ne: 'TEST' },
        };
        if (query.category && query.category.trim() !== '') {
            const catSlugOrId = query.category.trim();
            const categoryDoc = await this.categoryModel
                .findOne({
                $or: [
                    { slug: catSlugOrId },
                    { name: catSlugOrId },
                    ...(catSlugOrId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: catSlugOrId }] : []),
                ],
            })
                .exec();
            if (categoryDoc) {
                filter.categoryId = categoryDoc._id;
            }
            else {
                filter.categoryId = '000000000000000000000000';
            }
        }
        else if (query.department && query.department.trim() !== '') {
            const dept = query.department.trim().toLowerCase();
            const deptCats = await this.categoryModel
                .find({ department: dept })
                .select('_id')
                .exec();
            const catIds = deptCats.map((c) => c._id);
            filter.categoryId = { $in: catIds };
        }
        if (query.search && query.search.trim() !== '') {
            const s = query.search.trim();
            filter.$or = [
                { name: { $regex: s, $options: 'i' } },
                { description: { $regex: s, $options: 'i' } },
            ];
        }
        if (query.minPrice !== undefined || query.maxPrice !== undefined) {
            filter.salePrice = {};
            if (query.minPrice !== undefined)
                filter.salePrice.$gte = Number(query.minPrice);
            if (query.maxPrice !== undefined)
                filter.salePrice.$lte = Number(query.maxPrice);
        }
        let sortOption = { createdAt: -1 };
        if (query.sort === 'price_asc')
            sortOption = { salePrice: 1 };
        if (query.sort === 'price_desc')
            sortOption = { salePrice: -1 };
        if (query.sort === 'popular')
            sortOption = { createdAt: -1 };
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(query.limit) || 50));
        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            this.productModel
                .find(filter)
                .populate('categoryId', 'name slug department')
                .sort(sortOption)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.productModel.countDocuments(filter).exec(),
        ]);
        return {
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findBySlug(slug) {
        const product = await this.productModel
            .findOne({ slug })
            .populate('categoryId', 'name slug')
            .exec();
        if (!product) {
            throw new common_1.NotFoundException(`Product "${slug}" not found`);
        }
        if (product.dataMode === 'TEST' ||
            product.status === 'ARCHIVED' ||
            product.status === 'HIDDEN' ||
            product.status === 'DRAFT' ||
            product.isPublished === false) {
            throw new common_1.NotFoundException(`Product "${slug}" not available`);
        }
        return product;
    }
    async findById(id) {
        const product = await this.productModel.findById(id).populate('categoryId', 'name slug').exec();
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        return product;
    }
    async findAdminAll(query) {
        const filter = {};
        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { slug: { $regex: query.search, $options: 'i' } },
            ];
        }
        if (query.categoryId) {
            filter.categoryId = query.categoryId;
        }
        if (query.isPublished !== undefined) {
            filter.isPublished = query.isPublished;
        }
        if (query.status && query.status !== 'ALL') {
            filter.status = query.status;
        }
        if (query.dataMode && query.dataMode !== 'ALL') {
            filter.dataMode = query.dataMode;
        }
        return this.productModel
            .find(filter)
            .populate('categoryId', 'name slug')
            .sort({ createdAt: -1 })
            .exec();
    }
    async ensureCategory(catInput) {
        const val = String(catInput).trim();
        if (!val || val === 'undefined' || val === 'null')
            return null;
        if (val.match(/^[0-9a-fA-F]{24}$/)) {
            const existing = await this.categoryModel.findById(val).exec();
            if (existing)
                return existing._id;
        }
        let found = await this.categoryModel.findOne({ $or: [{ slug: val }, { name: val }] }).exec();
        if (found)
            return found._id;
        const matched = exports.DEFAULT_AVELORA_CATEGORIES.find((d) => d.slug === val || d.name.toLowerCase() === val.toLowerCase());
        if (matched) {
            const created = await this.categoryModel.create({
                name: matched.name,
                slug: matched.slug,
                department: matched.department,
                description: matched.description,
            });
            return created._id;
        }
        const cleanSlug = val.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]+/g, '-').replace(/(^-|-$)+/g, '');
        const custom = await this.categoryModel.create({
            name: val,
            slug: cleanSlug || `cat-${Date.now().toString().slice(-4)}`,
            department: 'women',
        });
        return custom._id;
    }
    async create(data) {
        if (!data.name || !data.name.trim()) {
            throw new common_1.BadRequestException('Product name is required');
        }
        const payload = { ...data };
        if (!payload.slug || payload.slug.trim() === '') {
            const cleanSlug = payload.name
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9\u0980-\u09FF]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            payload.slug = cleanSlug && cleanSlug !== '-' ? cleanSlug : `prod-${Date.now().toString().slice(-6)}`;
        }
        if (payload.isPublished === undefined) {
            payload.isPublished = true;
        }
        if (payload.categoryId) {
            const resolvedCatId = await this.ensureCategory(payload.categoryId);
            if (resolvedCatId) {
                payload.categoryId = resolvedCatId;
            }
            else {
                delete payload.categoryId;
            }
        }
        else {
            delete payload.categoryId;
        }
        const existing = await this.productModel.findOne({ slug: payload.slug }).exec();
        if (existing) {
            payload.slug = `${payload.slug}-${Date.now().toString().slice(-4)}`;
        }
        this.normalizeProductImages(payload);
        this.validatePricingAndDates(payload);
        if (Array.isArray(payload.variants) && payload.variants.length > 0) {
            payload.variants = payload.variants.map((v, index) => ({
                sku: v.sku?.trim() || `AVE-${Date.now().toString().slice(-4)}-${index + 1}`,
                color: v.color?.trim() || '',
                colorHex: v.colorHex?.trim() || '',
                image: v.image?.trim() || '',
                size: v.size?.trim() || '',
                price: Number(v.price) > 0 ? Number(v.price) : Number(payload.salePrice) || Number(payload.originalPrice) || 0,
                costPrice: Number(v.costPrice) || 0,
                stockQuantity: Number(v.stockQuantity !== undefined ? v.stockQuantity : (v.stock || 10)),
                reservedQuantity: Number(v.reservedQuantity || 0),
            }));
        }
        else {
            payload.variants = [
                {
                    sku: `AVE-${Date.now().toString().slice(-5)}`,
                    color: 'Standard',
                    colorHex: '#C5A059',
                    image: payload.images?.[0] || '',
                    size: 'Standard',
                    price: Number(payload.salePrice) || Number(payload.originalPrice) || 0,
                    costPrice: 0,
                    stockQuantity: 10,
                    reservedQuantity: 0,
                },
            ];
        }
        try {
            const createdProduct = await this.productModel.create(payload);
            if (payload.categoryId && Array.isArray(payload.images) && payload.images.length > 0 && payload.images[0]) {
                try {
                    const category = await this.categoryModel.findById(payload.categoryId).exec();
                    if (category && (!category.image || category.image.trim() === '')) {
                        await this.categoryModel.findByIdAndUpdate(payload.categoryId, { image: payload.images[0] }).exec();
                    }
                }
                catch (e) {
                    console.error('Error auto-syncing category image:', e);
                }
            }
            return createdProduct;
        }
        catch (err) {
            console.error('Error in productModel.create:', err);
            throw new common_1.BadRequestException(err.message || 'Failed to create product document');
        }
    }
    async update(id, data) {
        const payload = { ...data };
        if (payload.slug && payload.slug.trim() !== '') {
            payload.slug = payload.slug
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9\u0980-\u09FF]+/g, '-')
                .replace(/(^-|-$)+/g, '');
        }
        if (payload.categoryId) {
            const resolvedCatId = await this.ensureCategory(payload.categoryId);
            if (resolvedCatId) {
                payload.categoryId = resolvedCatId;
            }
            else {
                delete payload.categoryId;
            }
        }
        else if (payload.categoryId === '' || payload.categoryId === null) {
            delete payload.categoryId;
        }
        this.normalizeProductImages(payload);
        this.validatePricingAndDates(payload);
        if (Array.isArray(payload.variants) && payload.variants.length > 0) {
            payload.variants = payload.variants.map((v, index) => ({
                sku: v.sku?.trim() || `AVE-${Date.now().toString().slice(-4)}-${index + 1}`,
                color: v.color?.trim() || '',
                colorHex: v.colorHex?.trim() || '',
                image: v.image?.trim() || '',
                size: v.size?.trim() || '',
                price: Number(v.price) > 0 ? Number(v.price) : Number(payload.salePrice) || Number(payload.originalPrice) || 0,
                costPrice: Number(v.costPrice) || 0,
                stockQuantity: Number(v.stockQuantity !== undefined ? v.stockQuantity : (v.stock || 0)),
                reservedQuantity: Number(v.reservedQuantity || 0),
            }));
        }
        try {
            const updated = await this.productModel
                .findByIdAndUpdate(id, payload, { new: true })
                .populate('categoryId', 'name slug department')
                .exec();
            if (!updated) {
                throw new common_1.NotFoundException('Product not found');
            }
            return updated;
        }
        catch (err) {
            console.error('Error in productModel.update:', err);
            throw new common_1.BadRequestException(err.message || 'Failed to update product');
        }
    }
    async archiveProduct(id, actorId) {
        const product = await this.productModel.findById(id).exec();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        product.status = 'ARCHIVED';
        await product.save();
        await this.auditLogService.logAction({
            adminId: actorId,
            action: 'PRODUCT_ARCHIVED',
            entityType: 'PRODUCT',
            entityId: id,
            newData: { name: product.name, slug: product.slug },
        });
        return product;
    }
    async restoreProduct(id, actorId) {
        const product = await this.productModel.findById(id).exec();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        product.status = 'ACTIVE';
        await product.save();
        await this.auditLogService.logAction({
            adminId: actorId,
            action: 'PRODUCT_RESTORED',
            entityType: 'PRODUCT',
            entityId: id,
            newData: { name: product.name, slug: product.slug },
        });
        return product;
    }
    async delete(id, actorId) {
        const product = await this.productModel.findById(id).exec();
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const [orderCount, poCount, txnCount, returnCount] = await Promise.all([
            this.orderModel.countDocuments({ 'items.productId': id }).exec(),
            this.purchaseOrderModel.countDocuments({ 'items.productId': id }).exec(),
            this.transactionModel.countDocuments({ productId: id }).exec(),
            this.returnRequestModel.countDocuments({ 'items.productId': id }).exec(),
        ]);
        const hasHistory = orderCount > 0 || poCount > 0 || txnCount > 0 || returnCount > 0;
        if (hasHistory) {
            if (product.dataMode !== 'TEST') {
                throw new common_1.BadRequestException('This product has transaction history and cannot be permanently deleted. Archive the product instead.');
            }
            await this.transactionModel.deleteMany({ productId: id }).exec();
        }
        await this.productModel.findByIdAndDelete(id).exec();
        await this.auditLogService.logAction({
            adminId: actorId,
            action: 'PRODUCT_PERMANENTLY_DELETED',
            entityType: 'PRODUCT',
            entityId: id,
            oldData: { name: product.name, slug: product.slug, dataMode: product.dataMode },
        });
        return { success: true, message: 'Product permanently deleted.' };
    }
    async clearAll() {
        const res = await this.productModel.deleteMany({ dataMode: 'TEST' }).exec();
        return { success: true, deletedCount: res.deletedCount || 0 };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(1, (0, mongoose_1.InjectModel)(category_schema_1.Category.name)),
    __param(2, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(3, (0, mongoose_1.InjectModel)(purchase_schema_1.PurchaseOrder.name)),
    __param(4, (0, mongoose_1.InjectModel)(inventory_transaction_schema_1.InventoryTransaction.name)),
    __param(5, (0, mongoose_1.InjectModel)(return_request_schema_1.ReturnRequest.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        audit_log_service_1.AuditLogService])
], ProductsService);
//# sourceMappingURL=products.service.js.map