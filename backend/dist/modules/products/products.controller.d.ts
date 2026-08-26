import { ProductsService } from './products.service';
import { Product } from '../../schemas/product.schema';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    getPublicProducts(query: any): Promise<{
        products: (import("mongoose").Document<unknown, {}, import("../../schemas/product.schema").ProductDocument, {}, import("mongoose").DefaultSchemaOptions> & Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
    getProductBySlug(slug: string): Promise<Product>;
    getAdminProducts(query: any): Promise<(import("mongoose").Document<unknown, {}, import("../../schemas/product.schema").ProductDocument, {}, import("mongoose").DefaultSchemaOptions> & Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getProductById(id: string): Promise<Product>;
    createProduct(body: Partial<Product>): Promise<Product>;
    updateProduct(id: string, body: Partial<Product>): Promise<Product>;
    clearAllProducts(): Promise<{
        success: boolean;
        deletedCount: number;
    }>;
    deleteProduct(id: string): Promise<{
        success: boolean;
    }>;
}
