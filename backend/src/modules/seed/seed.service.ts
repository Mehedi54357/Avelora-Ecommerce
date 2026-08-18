import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../../schemas/category.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { Expense, ExpenseDocument, ExpenseCategory } from '../../schemas/expense.schema';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedCategoriesAndProducts();
    await this.seedExpenses();
  }

  private async seedCategoriesAndProducts() {
    const hasWomenHijab = await this.categoryModel.findOne({ slug: 'women-hijab' }).exec();

    if (!hasWomenHijab) {
      this.logger.log('Seeding Aarong-style full department hierarchy (Women, Men, Kids)...');
      await this.categoryModel.deleteMany({});
      await this.productModel.deleteMany({});
    } else {
      return;
    }

    // 1. Full Department Category Hierarchy
    const categoriesData = [
      // === WOMEN ===
      {
        name: 'Hijab Collection',
        slug: 'women-hijab',
        department: 'women',
        description: 'Turkish Silk Georgette, Chiffon, Satin & Premium Abaya wraps',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        sortOrder: 1,
      },
      {
        name: 'Churi & Bangles',
        slug: 'women-churi-bangles',
        department: 'women',
        description: 'ঐতিহ্যবাহী কাঁচের চুড়ি, রেশমি ভেলভেট চুড়ি ও ১৮কে গোল্ড প্লেটেড কঙ্কন',
        image: 'https://images.unsplash.com/photo-1611591475152-478311399767?auto=format&fit=crop&w=800&q=80',
        sortOrder: 2,
      },
      {
        name: 'Hair Accessories',
        slug: 'women-hair-accessories',
        department: 'women',
        description: 'Pearl hairpins, crystal claw clips, and velvet headband accessories',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
        sortOrder: 3,
      },
      {
        name: 'Dresses & Modest Wear',
        slug: 'women-dresses',
        department: 'women',
        description: 'Designer festive kurtis, kaftans, and luxury modest festive gowns',
        image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
        sortOrder: 4,
      },
      {
        name: 'Shoes & Footwear',
        slug: 'women-shoes',
        department: 'women',
        description: 'Embroidered velvet nagras, embellished juttis, and bridal block heels',
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
        sortOrder: 5,
      },
      {
        name: 'Accessories & Fine Jewellery',
        slug: 'women-accessories',
        department: 'women',
        description: '18K gold-plated jhumkas, Kundan choker necklaces, and bridal payel sets',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
        sortOrder: 6,
      },

      // === MEN ===
      {
        name: 'Shoes & Loafers',
        slug: 'men-shoes',
        department: 'men',
        description: 'Full-grain Italian leather penny loafers, formal oxfords, and nagras',
        image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
        sortOrder: 7,
      },
      {
        name: 'Clothing & Panjabi',
        slug: 'men-clothing',
        department: 'men',
        description: 'Festive silk and fine cotton embroidered panjabis and waistcoats',
        image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
        sortOrder: 8,
      },
      {
        name: 'Accessories & Leather',
        slug: 'men-accessories',
        department: 'men',
        description: 'Genuine leather bi-fold wallets, artisan belts, and cufflinks',
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
        sortOrder: 9,
      },

      // === KIDS ===
      {
        name: 'Girls\' Dresses',
        slug: 'kids-girls-dresses',
        department: 'kids',
        description: 'Royal organza festive party gowns and velvet Diva Eid frocks for little princesses',
        image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80',
        sortOrder: 10,
      },
      {
        name: 'Girls\' Shoes',
        slug: 'kids-girls-shoes',
        department: 'kids',
        description: 'Glitter ballerina flats, soft cushioned nagras, and party sandals',
        image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
        sortOrder: 11,
      },
      {
        name: 'Boys\' Clothing',
        slug: 'kids-boys-clothing',
        department: 'kids',
        description: 'Little gentleman festive cotton panjabi sets and embroidered waistcoats',
        image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=800&q=80',
        sortOrder: 12,
      },
      {
        name: 'Boys\' Shoes',
        slug: 'kids-boys-shoes',
        department: 'kids',
        description: 'Comfort mini leather loafers and slip-on ethnic shoes',
        image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80',
        sortOrder: 13,
      },
      {
        name: 'Kids\' Accessories',
        slug: 'kids-accessories',
        department: 'kids',
        description: 'Floral headbands, bow hairpins, and mini ethnic jewellery sets',
        image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
        sortOrder: 14,
      },
    ];

    const createdCategories = await this.categoryModel.insertMany(categoriesData);
    const catMap = new Map(createdCategories.map((c) => [c.slug, c._id]));

    // 2. Seed Real High-End Products
    const productsData = [
      // WOMEN - HIJAB
      {
        name: 'AVELORA Premium Turkish Silk Georgette Hijab',
        slug: 'avelora-premium-turkish-silk-georgette-hijab',
        categoryId: catMap.get('women-hijab'),
        description: 'Imported Turkish Silk Georgette fabric with a delicate matte sheen, non-slip texture, and flawless drape. Perfect for all-day comfort and special occasions.',
        images: [
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85',
          'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=1000&q=85',
        ],
        originalPrice: 1200,
        discountPercentage: 15,
        salePrice: 1020,
        isPublished: true,
        variants: [
          { sku: 'AVE-HJB-GLD', color: 'Champagne Gold', size: '75 × 185 cm', price: 1020, costPrice: 550, stockQuantity: 30, reservedQuantity: 0 },
          { sku: 'AVE-HJB-EMR', color: 'Emerald Green', size: '75 × 185 cm', price: 1020, costPrice: 550, stockQuantity: 25, reservedQuantity: 0 },
          { sku: 'AVE-HJB-RSE', color: 'Dusty Rose', size: '75 × 185 cm', price: 1020, costPrice: 550, stockQuantity: 20, reservedQuantity: 0 },
          { sku: 'AVE-HJB-NOIR', color: 'Midnight Noir', size: '75 × 185 cm', price: 1020, costPrice: 550, stockQuantity: 35, reservedQuantity: 0 },
        ],
      },

      // WOMEN - CHURI & BANGLES (কাঁচের চুড়ি, রেশমি চুড়ি)
      {
        name: 'AVELORA প্রিমিয়াম কাঁচের চুড়ি সেট (Traditional Glass Churi 24 Pcs)',
        slug: 'avelora-traditional-glass-churi-set-24pcs',
        categoryId: catMap.get('women-churi-bangles'),
        description: 'খাঁটি দেশীয় ঐতিহ্যবাহী নিখুঁত কাঁচের চুড়ি সেট (২৪ পিস)। উজ্জ্বল ঝকমকে ফিনিশিং ও মিষ্টি খনখন আওয়াজ। AVELORA সিগনেচার গিফট বক্সে প্যাকেটজাত।',
        images: [
          'https://images.unsplash.com/photo-1611591475152-478311399767?auto=format&fit=crop&w=1000&q=85',
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=85',
        ],
        originalPrice: 850,
        discountPercentage: 15,
        salePrice: 720,
        isPublished: true,
        variants: [
          { sku: 'AVE-GLS-RED-24', color: 'গাঢ় লাল (Crimson Red)', size: 'Size 2.4', price: 720, costPrice: 350, stockQuantity: 20, reservedQuantity: 0 },
          { sku: 'AVE-GLS-RED-26', color: 'গাঢ় লাল (Crimson Red)', size: 'Size 2.6', price: 720, costPrice: 350, stockQuantity: 30, reservedQuantity: 0 },
          { sku: 'AVE-GLS-GRN-26', color: 'পান্না সবুজ (Emerald Green)', size: 'Size 2.6', price: 720, costPrice: 350, stockQuantity: 25, reservedQuantity: 0 },
          { sku: 'AVE-GLS-GLD-26', color: 'সোনালী কাঁচ (Golden Yellow)', size: 'Size 2.6', price: 720, costPrice: 350, stockQuantity: 20, reservedQuantity: 0 },
        ],
      },
      {
        name: 'AVELORA রয়েল রেশমি চুড়ি লাক্সারি বক্স (Royal Reshmi Velvet Churi 36 Pcs)',
        slug: 'avelora-royal-reshmi-velvet-churi-box-36pcs',
        categoryId: catMap.get('women-churi-bangles'),
        description: '৩৬ পিসের রাজকীয় রেশমি ভেলভেট কোটেড চুড়ি সেট। গোল্ডেন মাইক্রো-জরির নিখুঁত পাড় সহ ব্রাইডাল ও পার্টি লুকের জন্য সেরা চয়েস।',
        images: [
          'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1000&q=85',
        ],
        originalPrice: 1800,
        discountPercentage: 20,
        salePrice: 1440,
        isPublished: true,
        variants: [
          { sku: 'AVE-RSH-RED-26', color: 'রক্তিম লাল (Crimson Red)', size: 'Size 2.6', price: 1440, costPrice: 750, stockQuantity: 25, reservedQuantity: 0 },
          { sku: 'AVE-RSH-GLD-26', color: 'শ্যাম্পেইন গোল্ড (Champagne Gold)', size: 'Size 2.6', price: 1440, costPrice: 750, stockQuantity: 20, reservedQuantity: 0 },
          { sku: 'AVE-RSH-EMR-26', color: 'রয়েল পান্না (Emerald Green)', size: 'Size 2.6', price: 1440, costPrice: 750, stockQuantity: 16, reservedQuantity: 0 },
        ],
      },

      // WOMEN - ACCESSORIES (FINE JEWELLERY)
      {
        name: 'AVELORA Royal Peacock Meenakari Jhumka',
        slug: 'avelora-royal-peacock-meenakari-jhumka',
        categoryId: catMap.get('women-accessories'),
        description: 'Exquisite 18K gold-plated peacock motif jhumka earrings detailed with hand-painted meenakari enamel and natural pearl drops.',
        images: [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=85',
        ],
        originalPrice: 2800,
        discountPercentage: 15,
        salePrice: 2380,
        isPublished: true,
        variants: [
          { sku: 'AVE-JHM-GLD', color: 'Yellow Gold & Pearl', size: 'Medium Drop', price: 2380, costPrice: 1200, stockQuantity: 24, reservedQuantity: 0 },
          { sku: 'AVE-JHM-EMR', color: 'Gold & Emerald Green', size: 'Medium Drop', price: 2380, costPrice: 1200, stockQuantity: 18, reservedQuantity: 0 },
        ],
      },

      // WOMEN - SHOES
      {
        name: 'AVELORA Velvet Hand-Embroidered Nagra (Women)',
        slug: 'avelora-velvet-hand-embroidered-nagra-women',
        categoryId: catMap.get('women-shoes'),
        description: 'Pure velvet women’s nagra jutti intricately hand-embroidered with zardozi and gold sequins. Cushioned memory-foam insole.',
        images: [
          'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=85',
        ],
        originalPrice: 3200,
        discountPercentage: 15,
        salePrice: 2720,
        isPublished: true,
        variants: [
          { sku: 'AVE-NGR-BLK-37', color: 'Noir Black Velvet', size: 'Size 37', price: 2720, costPrice: 1450, stockQuantity: 10, reservedQuantity: 0 },
          { sku: 'AVE-NGR-BLK-38', color: 'Noir Black Velvet', size: 'Size 38', price: 2720, costPrice: 1450, stockQuantity: 15, reservedQuantity: 0 },
          { sku: 'AVE-NGR-BLK-39', color: 'Noir Black Velvet', size: 'Size 39', price: 2720, costPrice: 1450, stockQuantity: 12, reservedQuantity: 0 },
          { sku: 'AVE-NGR-RED-38', color: 'Maroon Red Velvet', size: 'Size 38', price: 2720, costPrice: 1450, stockQuantity: 12, reservedQuantity: 0 },
        ],
      },

      // MEN - SHOES
      {
        name: 'AVELORA Handcrafted Genuine Leather Loafers (Men)',
        slug: 'avelora-handcrafted-genuine-leather-loafers-men',
        categoryId: catMap.get('men-shoes'),
        description: 'Full-grain Italian calf leather men’s penny loafers with hand-stitched apron toe and anti-slip rubber-injected leather sole.',
        images: [
          'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1000&q=85',
        ],
        originalPrice: 4800,
        discountPercentage: 15,
        salePrice: 4080,
        isPublished: true,
        variants: [
          { sku: 'AVE-SH-MEN-BLK-41', color: 'Classic Black', size: 'Size 41', price: 4080, costPrice: 2200, stockQuantity: 8, reservedQuantity: 0 },
          { sku: 'AVE-SH-MEN-BLK-42', color: 'Classic Black', size: 'Size 42', price: 4080, costPrice: 2200, stockQuantity: 12, reservedQuantity: 0 },
          { sku: 'AVE-SH-MEN-BLK-43', color: 'Classic Black', size: 'Size 43', price: 4080, costPrice: 2200, stockQuantity: 10, reservedQuantity: 0 },
          { sku: 'AVE-SH-MEN-BRN-42', color: 'Tan Brown', size: 'Size 42', price: 4080, costPrice: 2200, stockQuantity: 8, reservedQuantity: 0 },
        ],
      },

      // KIDS - GIRLS' DRESSES
      {
        name: 'AVELORA Little Princess Floral Organza Festive Gown',
        slug: 'avelora-little-princess-floral-organza-festive-gown',
        categoryId: catMap.get('kids-girls-dresses'),
        description: 'Exquisite multi-layered organza party gown with hand-sewn 3D floral appliqués, soft cotton inner lining, and satin back-bow.',
        images: [
          'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=1000&q=85',
        ],
        originalPrice: 3500,
        discountPercentage: 15,
        salePrice: 2975,
        isPublished: true,
        variants: [
          { sku: 'AVE-KID-ORG-2Y', color: 'Blush Pink', size: 'Age 2-3 Years', price: 2975, costPrice: 1500, stockQuantity: 10, reservedQuantity: 0 },
          { sku: 'AVE-KID-ORG-4Y', color: 'Blush Pink', size: 'Age 4-5 Years', price: 2975, costPrice: 1500, stockQuantity: 14, reservedQuantity: 0 },
          { sku: 'AVE-KID-ORG-6Y', color: 'Blush Pink', size: 'Age 6-7 Years', price: 2975, costPrice: 1500, stockQuantity: 12, reservedQuantity: 0 },
        ],
      },
      {
        name: 'AVELORA Royal Velvet Little Diva Eid Frock',
        slug: 'avelora-royal-velvet-little-diva-eid-frock',
        categoryId: catMap.get('kids-girls-dresses'),
        description: 'Plush velvet festive frock with golden zardozi neckline and flared net hem.',
        images: [
          'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=1000&q=85',
        ],
        originalPrice: 3800,
        discountPercentage: 10,
        salePrice: 3420,
        isPublished: true,
        variants: [
          { sku: 'AVE-KID-VLV-MAR-3Y', color: 'Maroon Red', size: 'Age 3-4 Years', price: 3420, costPrice: 1750, stockQuantity: 10, reservedQuantity: 0 },
          { sku: 'AVE-KID-VLV-MAR-5Y', color: 'Maroon Red', size: 'Age 5-6 Years', price: 3420, costPrice: 1750, stockQuantity: 12, reservedQuantity: 0 },
        ],
      },
    ];

    await this.productModel.insertMany(productsData);
    this.logger.log('Successfully seeded Aarong-style full department hierarchy (Women, Men, Kids) and products.');
  }

  private async seedExpenses() {
    const count = await this.expenseModel.countDocuments().exec();
    if (count > 0) return;

    await this.expenseModel.insertMany([
      {
        title: 'Custom Luxury Shopping Bags & Churi Box Packaging Production',
        category: ExpenseCategory.PACKAGING_COST,
        amount: 8500,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        description: 'Premium gold-embossed paper bags and ribbon boxes',
      },
      {
        title: 'Eid Collection Photoshoot & Social Media Ad Campaign',
        category: ExpenseCategory.MARKETING_EXPENSE,
        amount: 12000,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        description: 'Meta Ads & model photoshoot',
      },
      {
        title: 'Courier Express Dispatch Bulk Prepaid Credits',
        category: ExpenseCategory.DELIVERY_COST,
        amount: 4500,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        description: 'Courier delivery charges prepaid deposit',
      },
    ]);
  }
}
