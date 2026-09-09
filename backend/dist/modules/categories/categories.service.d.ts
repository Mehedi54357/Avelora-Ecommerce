import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../../schemas/category.schema';
export declare class CategoriesService {
    private categoryModel;
    constructor(categoryModel: Model<CategoryDocument>);
    findAll(activeOnly?: boolean): Promise<Category[]>;
    findById(id: string): Promise<Category>;
    findBySlug(slug: string): Promise<Category>;
    create(data: Partial<Category>): Promise<Category>;
    update(id: string, data: Partial<Category>): Promise<Category>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
    clearAll(): Promise<{
        success: boolean;
        deletedCount: number;
    }>;
    resetDefaultCategories(): Promise<{
        success: boolean;
        count: number;
    }>;
}
