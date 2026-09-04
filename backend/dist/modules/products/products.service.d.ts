import { Model } from 'mongoose';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { CategoryDocument } from '../../schemas/category.schema';
export declare const DEFAULT_AVELORA_CATEGORIES: {
    slug: string;
    name: string;
    department: string;
    description: string;
}[];
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
export declare function evaluateProductPricing(product: {
    originalPrice: number;
    salePrice: number;
    discountPercentage?: number;
    isDiscountActive?: boolean;
    discountStartDate?: string | Date;
    discountEndDate?: string | Date;
}, now?: Date): ProductPricingEvaluation;
import { OrderDocument } from '../../schemas/order.schema';
import { PurchaseOrderDocument } from '../../schemas/purchase.schema';
import { InventoryTransactionDocument } from '../../schemas/inventory-transaction.schema';
import { ReturnRequestDocument } from '../../schemas/return-request.schema';
import { AuditLogService } from '../audit-log/audit-log.service';
export declare class ProductsService {
    private productModel;
    private categoryModel;
    private orderModel;
    private purchaseOrderModel;
    private transactionModel;
    private returnRequestModel;
    private readonly auditLogService;
    constructor(productModel: Model<ProductDocument>, categoryModel: Model<CategoryDocument>, orderModel: Model<OrderDocument>, purchaseOrderModel: Model<PurchaseOrderDocument>, transactionModel: Model<InventoryTransactionDocument>, returnRequestModel: Model<ReturnRequestDocument>, auditLogService: AuditLogService);
    private normalizeProductImages;
    private validatePricingAndDates;
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
        status?: string;
        dataMode?: string;
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
    archiveProduct(id: string, actorId?: string): Promise<Product>;
    restoreProduct(id: string, actorId?: string): Promise<Product>;
    delete(id: string, actorId?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    clearAll(): Promise<{
        success: boolean;
        deletedCount: number;
    }>;
}
