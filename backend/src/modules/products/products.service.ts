import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { Category, CategoryDocument } from '../../schemas/category.schema';

export const DEFAULT_AVELORA_CATEGORIES = [
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

export interface ProductPricingEvaluation {
  regularPrice: number;
  salePrice: number;
  effectivePrice: number;
  hasDiscount: boolean;
  discountPercentage: number;
  savingAmount: number;
  isDiscountActive: boolean;
  isScheduled: boolean;
  isExpired: boolean;
  isFuture: boolean;
}

export function evaluateProductPricing(
  product: {
    originalPrice: number;
    salePrice: number;
    discountPercentage?: number;
    isDiscountActive?: boolean;
    discountStartDate?: string | Date;
    discountEndDate?: string | Date;
  },
  now: Date = new Date(),
): ProductPricingEvaluation {
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

import { Order, OrderDocument } from '../../schemas/order.schema';
import { PurchaseOrder, PurchaseOrderDocument } from '../../schemas/purchase.schema';
import { InventoryTransaction, InventoryTransactionDocument } from '../../schemas/inventory-transaction.schema';
import { ReturnRequest, ReturnRequestDocument } from '../../schemas/return-request.schema';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(PurchaseOrder.name) private purchaseOrderModel: Model<PurchaseOrderDocument>,
    @InjectModel(InventoryTransaction.name) private transactionModel: Model<InventoryTransactionDocument>,
    @InjectModel(ReturnRequest.name) private returnRequestModel: Model<ReturnRequestDocument>,
    private readonly auditLogService: AuditLogService,
  ) {}

  private normalizeProductImages(payload: any) {
    if (Array.isArray(payload.productImages) && payload.productImages.length > 0) {
      let hasPrimary = false;
      const normalized = payload.productImages.map((img: any, idx: number) => {
        const url = typeof img === 'string' ? img.trim() : (img.url?.trim() || '');
        const isPrimary = typeof img === 'object' && Boolean(img.isPrimary);
        if (isPrimary) hasPrimary = true;
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
      }).filter((img: any) => Boolean(img.url));

      // Ensure exactly one primary image (first one if none is set)
      if (!hasPrimary && normalized.length > 0) {
        normalized[0].isPrimary = true;
      }

      // Authoritative ordering: primary image first or sorted by sortOrder
      normalized.sort((a: any, b: any) => (a.isPrimary ? -1 : b.isPrimary ? 1 : a.sortOrder - b.sortOrder));
      // Re-index sortOrder
      normalized.forEach((img: any, idx: number) => {
        img.sortOrder = idx;
      });

      payload.productImages = normalized;
      payload.images = normalized.map((img: any) => img.url);
    } else if (Array.isArray(payload.images) && payload.images.length > 0) {
      const cleanImages = payload.images.map((img: string) => String(img).trim()).filter(Boolean);
      payload.images = cleanImages;
      payload.productImages = cleanImages.map((url: string, idx: number) => ({
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

  private validatePricingAndDates(payload: any) {
    const orig = Number(payload.originalPrice) || 0;
    const sale = Number(payload.salePrice) || 0;

    if (payload.isDiscountActive !== false && sale > 0 && orig > 0) {
      if (sale >= orig) {
        throw new BadRequestException(`Sale price (৳${sale}) must be strictly less than original price (৳${orig})`);
      }
    }

    if (payload.discountStartDate && payload.discountEndDate) {
      const start = new Date(payload.discountStartDate);
      const end = new Date(payload.discountEndDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end.getTime() <= start.getTime()) {
        throw new BadRequestException('Discount end date must be strictly after start date');
      }
    }

    // Auto-compute discount percentage
    if (orig > 0 && sale > 0 && sale < orig) {
      payload.discountPercentage = Math.round(((orig - sale) / orig) * 100);
    } else if (payload.discountPercentage > 0 && orig > 0 && (!sale || sale === orig)) {
      payload.salePrice = Math.round(orig * (1 - payload.discountPercentage / 100));
    }
  }

  async findPublic(query: {
    category?: string;
    department?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    // Authoritative Server-Side Rule: Public Storefront = ACTIVE + PUBLISHED + PRODUCTION ONLY
    const filter: any = {
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
      } else {
        // If specific category was requested but does not exist, return 0 products
        filter.categoryId = '000000000000000000000000';
      }
    } else if (query.department && query.department.trim() !== '') {
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
      if (query.minPrice !== undefined) filter.salePrice.$gte = Number(query.minPrice);
      if (query.maxPrice !== undefined) filter.salePrice.$lte = Number(query.maxPrice);
    }

    let sortOption: any = { createdAt: -1 };
    if (query.sort === 'price_asc') sortOption = { salePrice: 1 };
    if (query.sort === 'price_desc') sortOption = { salePrice: -1 };
    if (query.sort === 'popular') sortOption = { createdAt: -1 };

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

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productModel
      .findOne({ slug })
      .populate('categoryId', 'name slug')
      .exec();

    if (!product) {
      throw new NotFoundException(`Product "${slug}" not found`);
    }

    // Direct public access protection: TEST, ARCHIVED, HIDDEN or UNPUBLISHED products are invisible
    if (
      product.dataMode === 'TEST' ||
      product.status === 'ARCHIVED' ||
      product.status === 'HIDDEN' ||
      product.status === 'DRAFT' ||
      product.isPublished === false
    ) {
      throw new NotFoundException(`Product "${slug}" not available`);
    }

    return product;
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).populate('categoryId', 'name slug').exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findAdminAll(query: {
    search?: string;
    categoryId?: string;
    isPublished?: boolean;
    status?: string;
    dataMode?: string;
  }) {
    const filter: any = {};
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

  private async ensureCategory(catInput: string): Promise<any> {
    const val = String(catInput).trim();
    if (!val || val === 'undefined' || val === 'null') return null;

    // 1. Check if it's already a valid ObjectId in DB
    if (val.match(/^[0-9a-fA-F]{24}$/)) {
      const existing = await this.categoryModel.findById(val).exec();
      if (existing) return existing._id;
    }

    // 2. Try finding by slug or name
    let found = await this.categoryModel.findOne({ $or: [{ slug: val }, { name: val }] }).exec();
    if (found) return found._id;

    // 3. Match from standard Avelora definitions or auto-create
    const matched = DEFAULT_AVELORA_CATEGORIES.find(
      (d) => d.slug === val || d.name.toLowerCase() === val.toLowerCase(),
    );

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

  async create(data: Partial<Product>): Promise<Product> {
    if (!data.name || !data.name.trim()) {
      throw new BadRequestException('Product name is required');
    }

    const payload: any = { ...data };

    // Robust Unicode & Bengali slug generator
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
      } else {
        delete payload.categoryId;
      }
    } else {
      delete payload.categoryId;
    }

    const existing = await this.productModel.findOne({ slug: payload.slug }).exec();
    if (existing) {
      payload.slug = `${payload.slug}-${Date.now().toString().slice(-4)}`;
    }

    // Normalize images and validate pricing
    this.normalizeProductImages(payload);
    this.validatePricingAndDates(payload);

    // Sanitize variants without overwriting variant-specific pricing
    if (Array.isArray(payload.variants) && payload.variants.length > 0) {
      payload.variants = payload.variants.map((v: any, index: number) => ({
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
    } else {
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

      // If category has no image yet and this product has an image, auto-assign first image to category
      if (payload.categoryId && Array.isArray(payload.images) && payload.images.length > 0 && payload.images[0]) {
        try {
          const category = await this.categoryModel.findById(payload.categoryId).exec();
          if (category && (!category.image || category.image.trim() === '')) {
            await this.categoryModel.findByIdAndUpdate(payload.categoryId, { image: payload.images[0] }).exec();
          }
        } catch (e) {
          console.error('Error auto-syncing category image:', e);
        }
      }

      return createdProduct;
    } catch (err: any) {
      console.error('Error in productModel.create:', err);
      throw new BadRequestException(err.message || 'Failed to create product document');
    }
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const payload: any = { ...data };

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
      } else {
        delete payload.categoryId;
      }
    } else if (payload.categoryId === '' || payload.categoryId === null) {
      delete payload.categoryId;
    }

    // Normalize images and validate pricing
    this.normalizeProductImages(payload);
    this.validatePricingAndDates(payload);

    if (Array.isArray(payload.variants) && payload.variants.length > 0) {
      payload.variants = payload.variants.map((v: any, index: number) => ({
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
        throw new NotFoundException('Product not found');
      }
      return updated;
    } catch (err: any) {
      console.error('Error in productModel.update:', err);
      throw new BadRequestException(err.message || 'Failed to update product');
    }
  }

  async archiveProduct(id: string, actorId?: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');
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

  async restoreProduct(id: string, actorId?: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');
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

  async delete(id: string, actorId?: string): Promise<{ success: boolean; message: string }> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Dependency check across all transactional history
    const [orderCount, poCount, txnCount, returnCount] = await Promise.all([
      this.orderModel.countDocuments({ 'items.productId': id } as any).exec(),
      this.purchaseOrderModel.countDocuments({ 'items.productId': id } as any).exec(),
      this.transactionModel.countDocuments({ productId: id } as any).exec(),
      this.returnRequestModel.countDocuments({ 'items.productId': id } as any).exec(),
    ]);

    const hasHistory = orderCount > 0 || poCount > 0 || txnCount > 0 || returnCount > 0;

    if (hasHistory) {
      if (product.dataMode !== 'TEST') {
        throw new BadRequestException(
          'This product has transaction history and cannot be permanently deleted. Archive the product instead.',
        );
      }
      // For TEST product with only test history: clean up test inventory transactions
      await this.transactionModel.deleteMany({ productId: id } as any).exec();
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

  async clearAll(): Promise<{ success: boolean; deletedCount: number }> {
    const res = await this.productModel.deleteMany({ dataMode: 'TEST' }).exec();
    return { success: true, deletedCount: res.deletedCount || 0 };
  }
}
