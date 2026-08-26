import { Model } from 'mongoose';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { CategoryDocument } from '../../schemas/category.schema';
export declare const DEFAULT_AVELORA_CATEGORIES: {
    slug: string;
    name: string;
    department: string;
    description: string;
}[];
export declare class ProductsService {
    private productModel;
    private categoryModel;
    constructor(productModel: Model<ProductDocument>, categoryModel: Model<CategoryDocument>);
    findPublic(query: {
        category?: string;
        department?: string;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
        sort?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        products: (import("mongoose").Document<unknown, {}, ProductDocument, {}, import("mongoose").DefaultSchemaOptions> & Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findBySlug(slug: string): Promise<Product>;
    findById(id: string): Promise<Product>;
    findAdminAll(query: {
        search?: string;
        categoryId?: string;
        isPublished?: boolean;
    }): Promise<(import("mongoose").Document<unknown, {}, ProductDocument, {}, import("mongoose").DefaultSchemaOptions> & Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    private ensureCategory;
    create(data: Partial<Product>): Promise<Product>;
    update(id: string, data: Partial<Product>): Promise<Product>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
    clearAll(): Promise<{
        success: boolean;
        deletedCount: number;
    }>;
}
