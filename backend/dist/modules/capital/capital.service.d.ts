import { Model, Types } from 'mongoose';
import { CapitalTransaction, CapitalTransactionDocument } from '../../schemas/capital.schema';
import { ProductInvestment, ProductInvestmentDocument } from '../../schemas/product-investment.schema';
import { ProductDocument } from '../../schemas/product.schema';
import { InventoryTransactionDocument } from '../../schemas/inventory-transaction.schema';
import { CategoryDocument } from '../../schemas/category.schema';
import { AuditLogService } from '../audit-log/audit-log.service';
export declare class CapitalService {
    private capitalModel;
    private productInvestmentModel;
    private productModel;
    private transactionModel;
    private categoryModel;
    private auditLogService;
    constructor(capitalModel: Model<CapitalTransactionDocument>, productInvestmentModel: Model<ProductInvestmentDocument>, productModel: Model<ProductDocument>, transactionModel: Model<InventoryTransactionDocument>, categoryModel: Model<CategoryDocument>, auditLogService: AuditLogService);
    getTransactions(query: {
        type?: string;
        limit?: number;
    }): Promise<(import("mongoose").Document<unknown, {}, CapitalTransactionDocument, {}, import("mongoose").DefaultSchemaOptions> & CapitalTransaction & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    createTransaction(data: Partial<CapitalTransaction>, actor?: string): Promise<import("mongoose").Document<unknown, {}, CapitalTransactionDocument, {}, import("mongoose").DefaultSchemaOptions> & CapitalTransaction & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    deleteTransaction(id: string, actor?: string): Promise<{
        success: boolean;
    }>;
    getCapitalSummary(): Promise<{
        totalCapitalIn: number;
        totalWithdrawals: number;
        netCapital: number;
        totalLoansIn: number;
        totalLoansRepaid: number;
        netLoans: number;
        totalEquityAndDebt: number;
        totalProductInvestmentAmount: number;
        totalUnitsInvested: number;
        productInvestmentsCount: number;
        recentTransactions: (import("mongoose").Document<unknown, {}, CapitalTransactionDocument, {}, import("mongoose").DefaultSchemaOptions> & CapitalTransaction & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    getProductInvestments(query: {
        from?: string;
        to?: string;
        productId?: string;
        search?: string;
        limit?: number;
    }): Promise<{
        productImage: string;
        liveStock: number;
        liveWac: number;
        investmentId: string;
        date: Date;
        productId: import("mongoose").Schema.Types.ObjectId;
        productName: string;
        variantSku: string;
        variantDetails: string;
        quantity: number;
        purchasePrice: number;
        boxCost: number;
        transportCost: number;
        polyCost: number;
        stickerCost: number;
        tagCost: number;
        otherCost: number;
        additionalCostPerUnit: number;
        actualCostPerUnit: number;
        totalInvestment: number;
        remainingStock: number;
        paymentAccount: string;
        notes: string;
        recordedBy: string;
        auditHistory: import("../../schemas/product-investment.schema").InvestmentAuditEntry[];
        _id: Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }[]>;
    getInvestmentProductsSummary(): Promise<{
        _id: any;
        name: string;
        slug: string;
        status: string;
        isPublished: boolean;
        hasInvestment: boolean;
        investmentCount: number;
        totalInvestedUnits: number;
        totalInvestedCost: number;
        totalStock: number;
        currentWac: number;
        variants: import("../../schemas/product.schema").ProductVariant[];
        images: string[];
        salePrice: number;
        originalPrice: number;
        createdAt: any;
    }[]>;
    private autoDetectCategoryId;
    createProductInvestment(data: any, actor?: string): Promise<import("mongoose").Document<unknown, {}, ProductInvestmentDocument, {}, import("mongoose").DefaultSchemaOptions> & ProductInvestment & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateProductInvestment(id: string, data: any, actor?: string): Promise<import("mongoose").Document<unknown, {}, ProductInvestmentDocument, {}, import("mongoose").DefaultSchemaOptions> & ProductInvestment & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    deleteProductInvestment(id: string, actor?: string): Promise<{
        success: boolean;
    }>;
    adjustDamagedOrLostStock(payload: {
        productId: string;
        variantSku: string;
        quantity: number;
        reason: 'DAMAGED' | 'LOST' | 'EXPIRED' | 'INVENTORY_DISCREPANCY';
        notes?: string;
    }, actor?: string): Promise<{
        success: boolean;
        productId: Types.ObjectId;
        variantSku: string;
        writtenOffQuantity: number;
        unitCost: number;
        lossAmount: number;
        remainingStock: number;
        reason: "EXPIRED" | "DAMAGED" | "LOST" | "INVENTORY_DISCREPANCY";
    }>;
    exportProductInvestmentsCsv(query: {
        from?: string;
        to?: string;
        search?: string;
    }): Promise<string>;
}
