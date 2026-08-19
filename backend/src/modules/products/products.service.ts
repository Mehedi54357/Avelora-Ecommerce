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

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

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
    const filter: any = { isPublished: { $ne: false } };

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
        // If specific category was requested but does not exist, return 0 products (do not leak all products)
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
    return product;
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).populate('categoryId', 'name slug').exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findAdminAll(query: { search?: string; categoryId?: string; isPublished?: boolean }) {
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

    // Calculate salePrice if discount is given
    if (payload.originalPrice && payload.discountPercentage && (!payload.salePrice || payload.salePrice === payload.originalPrice)) {
      payload.salePrice = Math.round(payload.originalPrice * (1 - payload.discountPercentage / 100));
    } else if (!payload.salePrice && payload.originalPrice) {
      payload.salePrice = payload.originalPrice;
    }

    // Sanitize variants
    if (Array.isArray(payload.variants) && payload.variants.length > 0) {
      payload.variants = payload.variants.map((v: any, index: number) => ({
        sku: v.sku?.trim() || `AVE-${Date.now().toString().slice(-4)}-${index + 1}`,
        color: v.color?.trim() || '',
        size: v.size?.trim() || '',
        price: Number(v.price) || Number(payload.salePrice) || Number(payload.originalPrice) || 0,
        costPrice: Number(v.costPrice) || 0,
        stockQuantity: Number(v.stockQuantity !== undefined ? v.stockQuantity : (v.stock || 10)),
        reservedQuantity: Number(v.reservedQuantity || 0),
      }));
    } else {
      payload.variants = [
        {
          sku: `AVE-${Date.now().toString().slice(-5)}`,
          color: 'Standard',
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

    if (payload.originalPrice && payload.discountPercentage && !payload.salePrice) {
      payload.salePrice = Math.round(payload.originalPrice * (1 - payload.discountPercentage / 100));
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

    if (Array.isArray(payload.variants) && payload.variants.length > 0) {
      payload.variants = payload.variants.map((v: any, index: number) => ({
        sku: v.sku?.trim() || `AVE-${Date.now().toString().slice(-4)}-${index + 1}`,
        color: v.color?.trim() || '',
        size: v.size?.trim() || '',
        price: Number(v.price) || Number(payload.salePrice) || Number(payload.originalPrice) || 0,
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

  async delete(id: string): Promise<{ success: boolean }> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Product not found');
    }
    return { success: true };
  }

  async clearAll(): Promise<{ success: boolean; deletedCount: number }> {
    const res = await this.productModel.deleteMany({}).exec();
    return { success: true, deletedCount: res.deletedCount || 0 };
  }
}
