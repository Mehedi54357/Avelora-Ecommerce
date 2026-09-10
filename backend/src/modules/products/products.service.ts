import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { Category, CategoryDocument } from '../../schemas/category.schema';
import { Order, OrderDocument } from '../../schemas/order.schema';
import { PurchaseOrder, PurchaseOrderDocument } from '../../schemas/purchase.schema';
import { InventoryTransaction, InventoryTransactionDocument } from '../../schemas/inventory-transaction.schema';
import { ReturnRequest, ReturnRequestDocument } from '../../schemas/return-request.schema';
import { AuditLogService } from '../audit-log/audit-log.service';

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

@Injectable()
export class ProductsService implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(PurchaseOrder.name) private purchaseOrderModel: Model<PurchaseOrderDocument>,
    @InjectModel(InventoryTransaction.name) private transactionModel: Model<InventoryTransactionDocument>,
    @InjectModel(ReturnRequest.name) private returnRequestModel: Model<ReturnRequestDocument>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async onModuleInit() {
    await this.normalizeLegacyProducts();
  }

  async seedDefaultProducts() {
    try {
      const hijabCat = await this.categoryModel.findOne({ $or: [{ slug: 'women-hijab' }, { name: /hijab/i }] }).exec();
      const churiCat = await this.categoryModel.findOne({ $or: [{ slug: 'women-churi-bangles' }, { name: /churi|bangle/i }] }).exec();
      const jewelleryCat = await this.categoryModel.findOne({ $or: [{ slug: 'women-accessories' }, { name: /jewellery|jewelry|accessories/i }] }).exec();

      const defaultProducts = [
        {
          name: 'CY Cotton Hijab',
          subtitle: 'Soft, Lightweight & Breathable Daily Hijab',
          slug: 'cy-cotton-hijab',
          categoryId: hijabCat?._id,
          badge: 'BEST SELLER',
          unitBadge: '',
          rating: 4.9,
          reviewsCount: 142,
          originalPrice: 450,
          salePrice: 350,
          discountPercentage: 22,
          isDiscountActive: true,
          isPublished: true,
          status: 'ACTIVE',
          dataMode: 'PRODUCTION',
          images: [
            'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85',
          ],
          productImages: [
            {
              url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
              isPrimary: true,
              sortOrder: 0,
              variantColor: 'Olive',
            },
            {
              url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85',
              isPrimary: false,
              sortOrder: 1,
              variantColor: 'Dusty Pink',
            },
          ],
          features: [
            { title: 'Soft & Comfortable', subtitle: '100% fine cotton yarn, non-irritating', icon: 'feather' },
            { title: 'Lightweight & Breathable', subtitle: 'Designed for effortless all-day wear', icon: 'wind' },
            { title: 'Non-Slip Texture', subtitle: 'Stays in place without frequent readjustment', icon: 'layers' },
            { title: 'Glossy & Elegant Finish', subtitle: 'Flawless drape for work, party & casual', icon: 'waves' },
            { title: 'Signature Packaging', subtitle: 'Arrives in Avelora gold-embossed bag', icon: 'crown' },
          ],
          description: 'Crafted from premium CY cotton yarn, this hijab provides a lightweight, airy drape with a subtle luster that stays in place all day.',
          variants: [
            { sku: 'AVE-CY-01', color: 'Olive', colorHex: '#556B2F', size: 'Standard', price: 350, costPrice: 180, stockQuantity: 25 },
            { sku: 'AVE-CY-02', color: 'Dusty Pink', colorHex: '#E08B9B', size: 'Standard', price: 350, costPrice: 180, stockQuantity: 20 },
            { sku: 'AVE-CY-03', color: 'Purple', colorHex: '#6B21A8', size: 'Standard', price: 350, costPrice: 180, stockQuantity: 15 },
            { sku: 'AVE-CY-04', color: 'Magenta', colorHex: '#D946EF', size: 'Standard', price: 350, costPrice: 180, stockQuantity: 15 },
            { sku: 'AVE-CY-05', color: 'Cyan', colorHex: '#06B6D4', size: 'Standard', price: 350, costPrice: 180, stockQuantity: 15 },
          ],
        },
        {
          name: 'Popcorn Cotton Hijab',
          subtitle: 'Textured Soft Luxury Feel Hijab',
          slug: 'popcorn-cotton-hijab',
          categoryId: hijabCat?._id,
          badge: 'BEST SELLER',
          rating: 4.8,
          reviewsCount: 98,
          originalPrice: 420,
          salePrice: 350,
          discountPercentage: 17,
          isDiscountActive: true,
          isPublished: true,
          status: 'ACTIVE',
          dataMode: 'PRODUCTION',
          images: [
            'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
          ],
          productImages: [
            {
              url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85',
              isPrimary: true,
              sortOrder: 0,
              variantColor: 'Lavender',
            },
          ],
          features: [
            { title: 'Rich Popcorn Texture', subtitle: 'Tactile textured surface with rich body', icon: 'layers' },
            { title: 'Breathable Pure Cotton', subtitle: 'Ultra-gentle against sensitive hair and skin', icon: 'feather' },
            { title: 'Generous 90x30 Coverage', subtitle: 'Ideal for chest coverage and layered styling', icon: 'wind' },
            { title: 'No-Iron Ease', subtitle: 'Resists wrinkles and folds naturally', icon: 'waves' },
            { title: 'Artisan Quality', subtitle: 'Hand-finished neat laser cut hems', icon: 'award' },
          ],
          description: 'The Popcorn Cotton Hijab features a signature textured weave that gives extra volume and a sophisticated tactile appearance.',
          variants: [
            { sku: 'AVE-PC-01', color: 'Lavender', colorHex: '#B57EDC', size: 'Standard', price: 350, costPrice: 190, stockQuantity: 30 },
            { sku: 'AVE-PC-02', color: 'Olive', colorHex: '#556B2F', size: 'Standard', price: 350, costPrice: 190, stockQuantity: 20 },
            { sku: 'AVE-PC-03', color: 'Dusty Pink', colorHex: '#E08B9B', size: 'Standard', price: 350, costPrice: 190, stockQuantity: 20 },
            { sku: 'AVE-PC-04', color: 'Purple', colorHex: '#6B21A8', size: 'Standard', price: 350, costPrice: 190, stockQuantity: 15 },
            { sku: 'AVE-PC-05', color: 'Cyan', colorHex: '#06B6D4', size: 'Standard', price: 350, costPrice: 190, stockQuantity: 15 },
          ],
        },
        {
          name: 'Dubai Ceri Hijab',
          subtitle: 'Premium Cherry Fabric Luxury Feel',
          slug: 'dubai-ceri-hijab',
          categoryId: hijabCat?._id,
          badge: 'BEST SELLER',
          rating: 4.9,
          reviewsCount: 184,
          originalPrice: 480,
          salePrice: 350,
          discountPercentage: 27,
          isDiscountActive: true,
          isPublished: true,
          status: 'ACTIVE',
          dataMode: 'PRODUCTION',
          images: [
            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
          ],
          productImages: [
            {
              url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85',
              isPrimary: true,
              sortOrder: 0,
              variantColor: 'Nude Beige',
            },
          ],
          features: [
            { title: 'Dubai Cherry Georgette', subtitle: 'Silky smooth premium import fabric', icon: 'feather' },
            { title: 'Fluid Royal Drape', subtitle: 'Falls gracefully without bunching', icon: 'waves' },
            { title: 'Anti-Sweat Weave', subtitle: 'Keeps you fresh throughout warm days', icon: 'wind' },
            { title: 'Fade-Resistant Colors', subtitle: 'Stays vibrant wash after wash', icon: 'sparkles' },
            { title: 'Signature Packaging', subtitle: 'Wrapped with satin ribbon and certificate', icon: 'crown' },
          ],
          description: 'Imported Dubai Cherry fabric hijab with a silky smooth touch and rich regal drape.',
          variants: [
            { sku: 'AVE-DC-01', color: 'Nude Beige', colorHex: '#CDB49B', size: 'Standard', price: 350, costPrice: 195, stockQuantity: 40 },
            { sku: 'AVE-DC-02', color: 'Olive', colorHex: '#556B2F', size: 'Standard', price: 350, costPrice: 195, stockQuantity: 25 },
            { sku: 'AVE-DC-03', color: 'Black', colorHex: '#0F172A', size: 'Standard', price: 350, costPrice: 195, stockQuantity: 30 },
            { sku: 'AVE-DC-04', color: 'White', colorHex: '#FFFFFF', size: 'Standard', price: 350, costPrice: 195, stockQuantity: 20 },
            { sku: 'AVE-DC-05', color: 'Maroon', colorHex: '#58111A', size: 'Standard', price: 350, costPrice: 195, stockQuantity: 20 },
            { sku: 'AVE-DC-06', color: 'Navy Blue', colorHex: '#1B2A4A', size: 'Standard', price: 350, costPrice: 195, stockQuantity: 20 },
          ],
        },
        {
          name: 'JAFRAN HIJAB',
          subtitle: '90/30 Inch Exclusive Luxury Wrap',
          slug: 'jafran-hijab',
          categoryId: hijabCat?._id,
          badge: 'BEST SELLER',
          rating: 5.0,
          reviewsCount: 210,
          originalPrice: 450,
          salePrice: 350,
          discountPercentage: 22,
          isDiscountActive: true,
          isPublished: true,
          status: 'ACTIVE',
          dataMode: 'PRODUCTION',
          images: [
            'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85',
          ],
          productImages: [
            {
              url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
              isPrimary: true,
              sortOrder: 0,
              variantColor: 'Olive',
            },
          ],
          features: [
            { title: 'Fine Jafran Weave', subtitle: 'Ultra-soft microfilament blend', icon: 'feather' },
            { title: 'Generous 90x30 Inch', subtitle: 'Full modest wrap and styling freedom', icon: 'layers' },
            { title: 'Non-Irritating Skin Feel', subtitle: 'Dermatologically comfortable', icon: 'heart' },
            { title: 'Vibrant Pastel Shades', subtitle: 'Exclusively dyed luxury hues', icon: 'sparkles' },
            { title: 'Avelora Atelier Quality', subtitle: 'Every piece inspected by hand', icon: 'award' },
          ],
          description: 'The iconic Jafran Hijab is beloved for its unmatched softness, perfect weight, and luxurious look.',
          variants: [
            { sku: 'AVE-JF-01', color: 'Olive', colorHex: '#556B2F', size: 'Standard', price: 350, costPrice: 185, stockQuantity: 35 },
            { sku: 'AVE-JF-02', color: 'Magenta', colorHex: '#D946EF', size: 'Standard', price: 350, costPrice: 185, stockQuantity: 25 },
            { sku: 'AVE-JF-03', color: 'Dusty Pink', colorHex: '#E08B9B', size: 'Standard', price: 350, costPrice: 185, stockQuantity: 25 },
            { sku: 'AVE-JF-04', color: 'Purple', colorHex: '#6B21A8', size: 'Standard', price: 350, costPrice: 185, stockQuantity: 20 },
            { sku: 'AVE-JF-05', color: 'Cyan', colorHex: '#06B6D4', size: 'Standard', price: 350, costPrice: 185, stockQuantity: 20 },
          ],
        },
        {
          name: 'Velvet Reshmi Churi Box Set (ভেলভেট রেশমি চুড়ি)',
          subtitle: 'ঐতিহ্যবাহী ভেলভেট চুড়ি ও গোল্ড প্লেটেড কঙ্কন সেট',
          slug: 'velvet-reshmi-churi-box-set',
          categoryId: churiCat?._id,
          badge: 'TRENDING',
          rating: 4.9,
          reviewsCount: 76,
          originalPrice: 750,
          salePrice: 550,
          discountPercentage: 27,
          isDiscountActive: true,
          isPublished: true,
          status: 'ACTIVE',
          dataMode: 'PRODUCTION',
          images: [
            'https://images.unsplash.com/photo-1611591475152-478311399767?auto=format&fit=crop&w=1200&q=85',
          ],
          productImages: [
            {
              url: 'https://images.unsplash.com/photo-1611591475152-478311399767?auto=format&fit=crop&w=1200&q=85',
              isPrimary: true,
              sortOrder: 0,
              variantColor: 'Maroon',
            },
          ],
          features: [
            { title: 'Velvet Reshmi Finish', subtitle: 'Royal soft velvet touch on durable glass', icon: 'feather' },
            { title: '24-Piece Box Set', subtitle: 'Complete set with gold side bangles', icon: 'layers' },
            { title: 'Snug Fit Sizes', subtitle: 'Available in 2-4, 2-6, and 2-8 diameters', icon: 'check' },
            { title: 'Festive & Bridal', subtitle: 'Perfect for Eid, Holud, weddings & parties', icon: 'sparkles' },
            { title: 'Velvet Keepsake Box', subtitle: 'Includes protective magnetic closure box', icon: 'crown' },
          ],
          description: 'Handcrafted velvet reshmi bangles paired with gold-accented side bracelets, presented in a luxury velvet gift box.',
          variants: [
            { sku: 'AVE-CHR-01', color: 'Maroon', colorHex: '#58111A', size: '2-4', price: 550, costPrice: 280, stockQuantity: 20 },
            { sku: 'AVE-CHR-02', color: 'Maroon', colorHex: '#58111A', size: '2-6', price: 550, costPrice: 280, stockQuantity: 25 },
            { sku: 'AVE-CHR-03', color: 'Red', colorHex: '#DC2626', size: '2-6', price: 550, costPrice: 280, stockQuantity: 20 },
            { sku: 'AVE-CHR-04', color: 'Emerald Green', colorHex: '#16A34A', size: '2-6', price: 550, costPrice: 280, stockQuantity: 15 },
            { sku: 'AVE-CHR-05', color: 'Gold', colorHex: '#C5A059', size: '2-6', price: 550, costPrice: 280, stockQuantity: 15 },
          ],
        },
        {
          name: '18K Gold-Plated Kundan Jhumka Set',
          subtitle: 'Artisan Hand-Set Stones & Pearl Drops',
          slug: '18k-gold-plated-kundan-jhumka-set',
          categoryId: jewelleryCat?._id,
          badge: 'LUXURY',
          rating: 4.9,
          reviewsCount: 64,
          originalPrice: 1200,
          salePrice: 850,
          discountPercentage: 29,
          isDiscountActive: true,
          isPublished: true,
          status: 'ACTIVE',
          dataMode: 'PRODUCTION',
          images: [
            'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85',
          ],
          productImages: [
            {
              url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85',
              isPrimary: true,
              sortOrder: 0,
              variantColor: 'Gold',
            },
          ],
          features: [
            { title: '18K Gold Electroplating', subtitle: 'Anti-tarnish long-lasting brilliant shine', icon: 'sparkles' },
            { title: 'Hand-Cut Kundan Stones', subtitle: 'Glittering artisanal faceted glass crystals', icon: 'crown' },
            { title: 'Natural Pearl Drops', subtitle: 'Delicate cluster pearl tassels', icon: 'feather' },
            { title: 'Hypoallergenic Posts', subtitle: 'Nickel-free safe for sensitive ears', icon: 'shield' },
            { title: 'Bespoke Jewelry Pouch', subtitle: 'Comes in Avelora satin travel pouch', icon: 'award' },
          ],
          description: 'A timeless heirloom Kundan jhumka set crafted with 18K gold finish and freshwater pearl tassels.',
          variants: [
            { sku: 'AVE-JHM-01', color: 'Gold', colorHex: '#C5A059', size: 'Standard', price: 850, costPrice: 420, stockQuantity: 30 },
            { sku: 'AVE-JHM-02', color: 'Silver / Ash', colorHex: '#CBD5E1', size: 'Standard', price: 850, costPrice: 420, stockQuantity: 15 },
          ],
        },
      ];

      for (const prod of defaultProducts) {
        const existing = await this.productModel.findOne({ slug: prod.slug }).exec();
        if (!existing) {
          await this.productModel.create(prod as any);
          this.logger.log(`Seeded default product: ${prod.name}`);
        }
      }

      return { message: 'Successfully initialized default showcase catalog', count: defaultProducts.length };
    } catch (e: any) {
      this.logger.error(`Error seeding default products: ${e.message}`);
      return { error: e.message };
    }
  }

  private async normalizeLegacyProducts() {
    try {
      // Clean up any test/demo product slugs if present
      const demoSlugs = [
        'cy-cotton-hijab',
        'popcorn-cotton-hijab',
        'dubai-ceri-hijab',
        'jafran-hijab',
        'velvet-reshmi-churi-box-set',
        '18k-gold-plated-kundan-jhumka-set',
      ];
      await this.productModel.deleteMany({ slug: { $in: demoSlugs } }).exec();

      // 1. Ensure all user products without explicit status are set to ACTIVE
      await this.productModel.updateMany(
        { $or: [{ status: { $exists: false } }, { status: null }, { status: '' }] },
        { $set: { status: 'ACTIVE' } },
      );

      // 2. Ensure all products without explicit dataMode are set to PRODUCTION
      await this.productModel.updateMany(
        { $or: [{ dataMode: { $exists: false } }, { dataMode: null }, { dataMode: '' }] },
        { $set: { dataMode: 'PRODUCTION' } },
      );

      // 3. Ensure all products without isPublished are set to true
      await this.productModel.updateMany(
        { isPublished: { $exists: false } },
        { $set: { isPublished: true } },
      );

      // 4. Accurately reclassify every product to its correct category
      const churiCat = await this.categoryModel.findOne({ $or: [{ slug: 'women-churi-bangles' }, { name: /churi|চুড়ি|চুড়ি|bangle/i }] }).exec();
      const hijabCat = await this.categoryModel.findOne({ $or: [{ slug: 'women-hijab' }, { name: /hijab|হিজাব/i }] }).exec();
      const hairCat = await this.categoryModel.findOne({ $or: [{ slug: 'women-hair-accessories' }, { name: /hair|হেয়ার|হেয়ার/i }] }).exec();
      const jewelleryCat = await this.categoryModel.findOne({ $or: [{ slug: 'women-accessories' }, { name: /jewel|accessories|জুয়েলারি|জুয়েলারি|গহনা/i }] }).exec();
      const dressesCat = await this.categoryModel.findOne({ $or: [{ slug: 'women-dresses' }, { name: /dress|ড্রেস|গাউন|kurti/i }] }).exec();
      const panjabiCat = await this.categoryModel.findOne({ $or: [{ slug: 'men-clothing' }, { name: /panjabi|পাঞ্জাবি/i }] }).exec();
      const menShoesCat = await this.categoryModel.findOne({ $or: [{ slug: 'men-shoes' }, { name: /loafer|men.*shoe|মেনস/i }] }).exec();
      const womenShoesCat = await this.categoryModel.findOne({ $or: [{ slug: 'women-shoes' }, { name: /nagra|shoe|জুতা|নাগরা/i }] }).exec();

      const allProducts = await this.productModel.find({}).exec();
      for (const prod of allProducts) {
        const text = `${prod.name || ''} ${prod.subtitle || ''} ${prod.description || ''}`.toLowerCase();

        if (
          text.includes('চুড়ি') ||
          text.includes('চুড়ি') ||
          text.includes('churi') ||
          text.includes('bangle') ||
          text.includes('reshmi') ||
          text.includes('resmi')
        ) {
          if (churiCat && String(prod.categoryId) !== String(churiCat._id)) {
            prod.categoryId = churiCat._id as any;
            await prod.save();
            this.logger.log(`Classified product "${prod.name}" -> Churi & Bangles category`);
          }
        } else if (
          text.includes('hijab') ||
          text.includes('হিজাব') ||
          text.includes('abaya') ||
          text.includes('scarf')
        ) {
          if (hijabCat && String(prod.categoryId) !== String(hijabCat._id)) {
            prod.categoryId = hijabCat._id as any;
            await prod.save();
            this.logger.log(`Classified product "${prod.name}" -> Hijab Collection category`);
          }
        } else if (
          text.includes('hair') ||
          text.includes('clip') ||
          text.includes('pin') ||
          text.includes('headband') ||
          text.includes('হেয়ার') ||
          text.includes('হেয়ার')
        ) {
          if (hairCat && String(prod.categoryId) !== String(hairCat._id)) {
            prod.categoryId = hairCat._id as any;
            await prod.save();
          }
        } else if (
          text.includes('jhumka') ||
          text.includes('ঝুমকা') ||
          text.includes('jewel') ||
          text.includes('গহনা') ||
          text.includes('necklace') ||
          text.includes('earring') ||
          text.includes('choker') ||
          text.includes('payel')
        ) {
          if (jewelleryCat && String(prod.categoryId) !== String(jewelleryCat._id)) {
            prod.categoryId = jewelleryCat._id as any;
            await prod.save();
          }
        } else if (text.includes('panjabi') || text.includes('পাঞ্জাবি')) {
          if (panjabiCat && String(prod.categoryId) !== String(panjabiCat._id)) {
            prod.categoryId = panjabiCat._id as any;
            await prod.save();
          }
        } else if (
          text.includes('loafer') ||
          text.includes('লোফার') ||
          text.includes('men')
        ) {
          if (menShoesCat && String(prod.categoryId) !== String(menShoesCat._id)) {
            prod.categoryId = menShoesCat._id as any;
            await prod.save();
          }
        } else if (
          text.includes('nagra') ||
          text.includes('নাগরা') ||
          text.includes('জুতা') ||
          text.includes('heel')
        ) {
          if (womenShoesCat && String(prod.categoryId) !== String(womenShoesCat._id)) {
            prod.categoryId = womenShoesCat._id as any;
            await prod.save();
          }
        } else if (
          text.includes('dress') ||
          text.includes('gown') ||
          text.includes('kurti') ||
          text.includes('গাউন') ||
          text.includes('ড্রেস')
        ) {
          if (dressesCat && String(prod.categoryId) !== String(dressesCat._id)) {
            prod.categoryId = dressesCat._id as any;
            await prod.save();
          }
        }
      }
    } catch (e: any) {
      this.logger.warn(`Failed to normalize legacy products: ${e.message}`);
    }
  }

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
    const andFilters: any[] = [
      {
        isPublished: { $ne: false },
        status: { $nin: ['DRAFT', 'HIDDEN', 'ARCHIVED'] },
        dataMode: { $ne: 'TEST' },
      },
    ];

    if (query.category && query.category.trim() !== '') {
      const catSlugOrId = query.category.trim();
      const cleanKeyword = catSlugOrId.replace(/^women-|^men-|^kids-/, '').trim();

      const matchingCats = await this.categoryModel
        .find({
          $or: [
            { slug: catSlugOrId },
            { name: catSlugOrId },
            ...(cleanKeyword
              ? [
                  { slug: { $regex: cleanKeyword, $options: 'i' } },
                  { name: { $regex: cleanKeyword, $options: 'i' } },
                ]
              : []),
            ...(catSlugOrId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: catSlugOrId }] : []),
          ],
        })
        .select('_id')
        .exec();

      const matchingCatIds = matchingCats.map((c) => c._id);

      if (catSlugOrId.includes('hijab') || cleanKeyword.includes('hijab')) {
        // Strict Hijab collection: matching category ID or hijab in name, EXCLUDING churi, bangle, jhumka
        andFilters.push({
          $or: [
            ...(matchingCatIds.length > 0 ? [{ categoryId: { $in: matchingCatIds } }] : []),
            { name: { $regex: /hijab|হিজাব|abaya|scarf/i } },
          ],
        });
        andFilters.push({
          name: { $not: /চুড়ি|চুড়ি|churi|bangle|reshmi|resmi|jhumka|ঝুমকা|earring|payel|necklace/i },
        });
      } else if (catSlugOrId.includes('churi') || catSlugOrId.includes('bangle') || cleanKeyword.includes('churi')) {
        // Strict Churi collection: matching category ID or churi in name, EXCLUDING hijab
        andFilters.push({
          $or: [
            ...(matchingCatIds.length > 0 ? [{ categoryId: { $in: matchingCatIds } }] : []),
            { name: { $regex: /churi|bangle|চুড়ি|চুড়ি|reshmi|resmi|কঙ্কন/i } },
          ],
        });
        andFilters.push({
          name: { $not: /hijab|হিজাব|abaya|scarf|jhumka|ঝুমকা/i },
        });
      } else if (catSlugOrId.includes('jewel') || catSlugOrId.includes('jhumka') || catSlugOrId.includes('accessories')) {
        // Strict Jewellery collection: EXCLUDING hijab, churi
        andFilters.push({
          $or: [
            ...(matchingCatIds.length > 0 ? [{ categoryId: { $in: matchingCatIds } }] : []),
            { name: { $regex: /jewel|jhumka|necklace|earring|গহনা|ঝুমকা|জুয়েলারি|জুয়েলারি|এক্সেসরিজ|payel/i } },
          ],
        });
        andFilters.push({
          name: { $not: /hijab|হিজাব|চুড়ি|চুড়ি|churi|bangle/i },
        });
      } else if (catSlugOrId.includes('hair') || cleanKeyword.includes('hair')) {
        andFilters.push({
          $or: [
            ...(matchingCatIds.length > 0 ? [{ categoryId: { $in: matchingCatIds } }] : []),
            { name: { $regex: /hair|clip|pin|headband|হেয়ার|হেয়ার/i } },
          ],
        });
      } else if (catSlugOrId.includes('dress') || catSlugOrId.includes('kurti') || catSlugOrId.includes('gown')) {
        andFilters.push({
          $or: [
            ...(matchingCatIds.length > 0 ? [{ categoryId: { $in: matchingCatIds } }] : []),
            { name: { $regex: /dress|gown|kurti|ড্রেস|গাউন|কুর্তি/i } },
          ],
        });
      } else if (catSlugOrId.includes('shoe') || catSlugOrId.includes('loafer') || catSlugOrId.includes('nagra')) {
        andFilters.push({
          $or: [
            ...(matchingCatIds.length > 0 ? [{ categoryId: { $in: matchingCatIds } }] : []),
            { name: { $regex: /shoe|loafer|nagra|জুতা|নাগরা|লোফার/i } },
          ],
        });
      } else if (catSlugOrId.includes('panjabi')) {
        andFilters.push({
          $or: [
            ...(matchingCatIds.length > 0 ? [{ categoryId: { $in: matchingCatIds } }] : []),
            { name: { $regex: /panjabi|পাঞ্জাবি/i } },
          ],
        });
      } else {
        if (matchingCatIds.length > 0) {
          andFilters.push({ categoryId: { $in: matchingCatIds } });
        } else {
          andFilters.push({ categoryId: '000000000000000000000000' });
        }
      }
    } else if (query.department && query.department.trim() !== '') {
      const dept = query.department.trim().toLowerCase();
      const deptCats = await this.categoryModel
        .find({ department: dept })
        .select('_id')
        .exec();
      const catIds = deptCats.map((c) => c._id);

      const deptClauses: any[] = [{ categoryId: { $in: catIds } }];
      if (dept === 'women') {
        deptClauses.push({ name: { $regex: /hijab|হিজাব|churi|bangle|চুড়ি|চুড়ি|jhumka|jewel|kurti|dress|গাউন/i } });
      } else if (dept === 'men') {
        deptClauses.push({ name: { $regex: /panjabi|পাঞ্জাবি|loafer|shoe|men|oxford/i } });
      } else if (dept === 'kids') {
        deptClauses.push({ name: { $regex: /kids|baby|princess|frock|বাচ্চা/i } });
      }

      andFilters.push({ $or: deptClauses });
    }

    if (query.search && query.search.trim() !== '') {
      const s = query.search.trim();
      andFilters.push({
        $or: [
          { name: { $regex: s, $options: 'i' } },
          { description: { $regex: s, $options: 'i' } },
        ],
      });
    }

    const filter: any = andFilters.length > 1 ? { $and: andFilters } : andFilters[0] || {};

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
