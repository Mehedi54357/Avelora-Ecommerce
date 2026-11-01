import { ProductsService } from './products.service';
import { Product } from '../../schemas/product.schema';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    getPublicProducts(query: any): Promise<any>;
    getProductBySlug(slug: string): Promise<Product>;
    getAdminProducts(query: any): Promise<(Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    seedDefaultProducts(): Promise<{
        message: string;
        count: number;
        error?: undefined;
    } | {
        error: any;
        message?: undefined;
        count?: undefined;
    }>;
    getProductById(id: string): Promise<Product>;
    createProduct(body: Partial<Product>): Promise<Product>;
    updateProduct(id: string, body: Partial<Product>): Promise<Product>;
    archiveProduct(id: string, req: any): Promise<Product>;
    restoreProduct(id: string, req: any): Promise<Product>;
    clearAllProducts(): Promise<{
        success: boolean;
        deletedCount: number;
    }>;
    deleteProduct(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
