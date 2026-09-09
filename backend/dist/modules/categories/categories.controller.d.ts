import { CategoriesService } from './categories.service';
import { Category } from '../../schemas/category.schema';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    getPublicCategories(): Promise<Category[]>;
    getCategoryBySlug(slug: string): Promise<Category>;
    getAllCategoriesAdmin(): Promise<Category[]>;
    createCategory(body: Partial<Category>): Promise<Category>;
    updateCategory(id: string, body: Partial<Category>): Promise<Category>;
    resetDefaultCategories(): Promise<{
        success: boolean;
        count: number;
    }>;
    clearAllCategories(): Promise<{
        success: boolean;
        deletedCount: number;
    }>;
    deleteCategory(id: string): Promise<{
        success: boolean;
    }>;
}
