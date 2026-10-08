import { CapitalService } from './capital.service';
import type { Response } from 'express';
export declare class CapitalController {
    private readonly capitalService;
    constructor(capitalService: CapitalService);
    getSummary(): Promise<{
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
        recentTransactions: (import("mongoose").Document<unknown, {}, import("../../schemas/capital.schema").CapitalTransactionDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/capital.schema").CapitalTransaction & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    getTransactions(query: any): Promise<(import("mongoose").Document<unknown, {}, import("../../schemas/capital.schema").CapitalTransactionDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/capital.schema").CapitalTransaction & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    createTransaction(body: any, req: any): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/capital.schema").CapitalTransactionDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/capital.schema").CapitalTransaction & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    deleteTransaction(id: string, req: any): Promise<{
        success: boolean;
    }>;
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
    getProductInvestments(query: any): Promise<{
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
        _id: import("mongoose").Types.ObjectId;
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
    exportProductInvestments(query: any, res: Response): Promise<Response<any, Record<string, any>>>;
    createProductInvestment(body: any, req: any): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/product-investment.schema").ProductInvestmentDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/product-investment.schema").ProductInvestment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateProductInvestment(id: string, body: any, req: any): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/product-investment.schema").ProductInvestmentDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/product-investment.schema").ProductInvestment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    deleteProductInvestment(id: string, req: any): Promise<{
        success: boolean;
    }>;
    adjustDamagedOrLostStock(body: any, req: any): Promise<{
        success: boolean;
        productId: import("mongoose").Types.ObjectId;
        variantSku: string;
        writtenOffQuantity: number;
        unitCost: number;
        lossAmount: number;
        remainingStock: number;
        reason: "EXPIRED" | "DAMAGED" | "LOST" | "INVENTORY_DISCREPANCY";
    }>;
}
