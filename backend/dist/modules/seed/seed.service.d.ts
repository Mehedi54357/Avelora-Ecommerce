import { OnApplicationBootstrap } from '@nestjs/common';
import { Model } from 'mongoose';
import { CategoryDocument } from '../../schemas/category.schema';
import { ProductDocument } from '../../schemas/product.schema';
import { ExpenseDocument } from '../../schemas/expense.schema';
export declare class SeedService implements OnApplicationBootstrap {
    private categoryModel;
    private productModel;
    private expenseModel;
    private readonly logger;
    constructor(categoryModel: Model<CategoryDocument>, productModel: Model<ProductDocument>, expenseModel: Model<ExpenseDocument>);
    onApplicationBootstrap(): Promise<void>;
    private seedCategoriesAndProducts;
    private seedExpenses;
}
