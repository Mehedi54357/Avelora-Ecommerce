import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../../schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) {}

  async findAll(activeOnly = false): Promise<Category[]> {
    const filter = activeOnly ? { isActive: true } : {};
    return this.categoryModel.find(filter).sort({ sortOrder: 1, createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryModel.findOne({ slug }).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async create(data: Partial<Category>): Promise<Category> {
    if (!data.slug || data.slug.trim() === '') {
      const cleanSlug = data.name
        ? data.name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\u0980-\u09FF]+/g, '-')
            .replace(/(^-|-$)+/g, '')
        : '';
      data.slug = cleanSlug && cleanSlug !== '-' ? cleanSlug : `cat-${Date.now().toString().slice(-6)}`;
    }
    const existing = await this.categoryModel.findOne({ slug: data.slug }).exec();
    if (existing) {
      data.slug = `${data.slug}-${Date.now().toString().slice(-4)}`;
    }
    return this.categoryModel.create(data);
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    const updated = await this.categoryModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException('Category not found');
    }
    return updated;
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Category not found');
    }
    return { success: true };
  }

  async clearAll(): Promise<{ success: boolean; deletedCount: number }> {
    const result = await this.categoryModel.deleteMany({}).exec();
    return { success: true, deletedCount: result.deletedCount || 0 };
  }

  async resetDefaultCategories(): Promise<{ success: boolean; count: number }> {
    await this.categoryModel.deleteMany({}).exec();

    const defaultCategories = [
      {
        name: 'Hijab Collection (হিজাব)',
        slug: 'women-hijab',
        department: 'women',
        description: 'Turkish Silk Georgette, Chiffon, Satin & Premium Abaya wraps',
        sortOrder: 1,
      },
      {
        name: 'Churi & Bangles (কাঁচের ও রেশমি চুড়ি)',
        slug: 'women-churi-bangles',
        department: 'women',
        description: 'ঐতিহ্যবাহী কাঁচের চুড়ি, রেশমি ভেলভেট চুড়ি ও কঙ্কন সেট',
        sortOrder: 2,
      },
      {
        name: 'Hair Accessories (হেয়ার এক্সেসরিজ)',
        slug: 'women-hair-accessories',
        department: 'women',
        description: 'Pearl hairpins, claw clips, and velvet headband accessories',
        sortOrder: 3,
      },
      {
        name: 'Dresses & Modest Wear (ড্রেস ও গাউন)',
        slug: 'women-dresses',
        department: 'women',
        description: 'Designer festive kurtis, kaftans, and luxury festive gowns',
        sortOrder: 4,
      },
      {
        name: 'Shoes & Footwear (জুতা ও নাগরা)',
        slug: 'women-shoes',
        department: 'women',
        description: 'Embroidered velvet nagras, embellished juttis, and block heels',
        sortOrder: 5,
      },
      {
        name: 'Accessories & Fine Jewellery (জুয়েলারি ও গহনা)',
        slug: 'women-accessories',
        department: 'women',
        description: '18K gold-plated jhumkas, Kundan choker necklaces, and payel sets',
        sortOrder: 6,
      },
      {
        name: 'Shoes & Loafers (মেনস জুতা ও লোফার)',
        slug: 'men-shoes',
        department: 'men',
        description: 'Italian leather penny loafers, formal oxfords, and nagras',
        sortOrder: 7,
      },
      {
        name: 'Clothing & Panjabi (মেনস পাঞ্জাবি)',
        slug: 'men-clothing',
        department: 'men',
        description: 'Festive silk and fine cotton embroidered panjabis',
        sortOrder: 8,
      },
      {
        name: 'Girls\' Dresses (বাচ্চাদের ড্রেস ও পার্টি গাউন)',
        slug: 'kids-girls-dresses',
        department: 'kids',
        description: 'Organza party gowns and velvet Eid frocks for little princesses',
        sortOrder: 9,
      },
      {
        name: 'Kids\' Shoes & Accessories (বাচ্চাদের জুতা ও এক্সেসরিজ)',
        slug: 'kids-accessories',
        department: 'kids',
        description: 'Kids footwear, headbands, and accessories',
        sortOrder: 10,
      },
    ];

    const res = await this.categoryModel.insertMany(defaultCategories);
    return { success: true, count: res.length };
  }
}
