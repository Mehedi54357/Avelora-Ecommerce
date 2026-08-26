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
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const category_schema_1 = require("../../schemas/category.schema");
const product_schema_1 = require("../../schemas/product.schema");
const expense_schema_1 = require("../../schemas/expense.schema");
let SeedService = SeedService_1 = class SeedService {
    categoryModel;
    productModel;
    expenseModel;
    logger = new common_1.Logger(SeedService_1.name);
    constructor(categoryModel, productModel, expenseModel) {
        this.categoryModel = categoryModel;
        this.productModel = productModel;
        this.expenseModel = expenseModel;
    }
    async onApplicationBootstrap() {
        await this.seedExpenses();
    }
    async seedCategoriesAndProducts() {
        const categoriesData = [
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
        await this.categoryModel.insertMany(categoriesData);
        this.logger.log('Successfully seeded clean Avelora category taxonomy (Hijabs, Churi & Bangles, Jewellery, Shoes, Panjabi, Kids) with ZERO demo products.');
    }
    async seedExpenses() {
        const count = await this.expenseModel.countDocuments().exec();
        if (count > 0)
            return;
        await this.expenseModel.insertMany([
            {
                title: 'Custom Luxury Shopping Bags & Churi Box Packaging Production',
                category: expense_schema_1.ExpenseCategory.PACKAGING_COST,
                amount: 8500,
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                description: 'Premium gold-embossed paper bags and ribbon boxes',
            },
            {
                title: 'Eid Collection Photoshoot & Social Media Ad Campaign',
                category: expense_schema_1.ExpenseCategory.MARKETING_EXPENSE,
                amount: 12000,
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                description: 'Meta Ads & model photoshoot',
            },
            {
                title: 'Courier Express Dispatch Bulk Prepaid Credits',
                category: expense_schema_1.ExpenseCategory.DELIVERY_COST,
                amount: 4500,
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                description: 'Courier delivery charges prepaid deposit',
            },
        ]);
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(category_schema_1.Category.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(2, (0, mongoose_1.InjectModel)(expense_schema_1.Expense.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], SeedService);
//# sourceMappingURL=seed.service.js.map