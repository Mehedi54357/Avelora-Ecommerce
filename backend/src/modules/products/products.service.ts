import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { Category, CategoryDocument } from '../../schemas/category.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async findPublic(query: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: any = { isPublished: true };

    if (query.category) {
      const categoryDoc = await this.categoryModel.findOne({ slug: query.category }).exec();
      if (categoryDoc) {
        filter.categoryId = categoryDoc._id;
      }
    }

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
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
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('categoryId', 'name slug')
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

  async create(data: Partial<Product>): Promise<Product> {
    if (!data.name) {
      throw new BadRequestException('Product name is required');
    }

    if (!data.slug) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const existing = await this.productModel.findOne({ slug: data.slug }).exec();
    if (existing) {
      data.slug = `${data.slug}-${Date.now().toString().slice(-4)}`;
    }

    // Calculate salePrice if discount is given
    if (data.originalPrice && data.discountPercentage && (!data.salePrice || data.salePrice === data.originalPrice)) {
      data.salePrice = Math.round(data.originalPrice * (1 - data.discountPercentage / 100));
    } else if (!data.salePrice && data.originalPrice) {
      data.salePrice = data.originalPrice;
    }

    return this.productModel.create(data);
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    if (data.originalPrice && data.discountPercentage && !data.salePrice) {
      data.salePrice = Math.round(data.originalPrice * (1 - data.discountPercentage / 100));
    }

    const updated = await this.productModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('categoryId', 'name slug')
      .exec();

    if (!updated) {
      throw new NotFoundException('Product not found');
    }
    return updated;
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Product not found');
    }
    return { success: true };
  }
}
