import { Model, Types } from 'mongoose';
import { InventoryTransaction, InventoryTransactionDocument, InventoryTransactionType } from '../../schemas/inventory-transaction.schema';
import { ProductDocument } from '../../schemas/product.schema';
export declare class InventoryService {
    private transactionModel;
    private productModel;
    private readonly logger;
    constructor(transactionModel: Model<InventoryTransactionDocument>, productModel: Model<ProductDocument>);
    logLedgerEntry(params: {
        productId: string;
        variantSku: string;
        previousQuantity: number;
        quantityChange: number;
        newQuantity: number;
        transactionType: InventoryTransactionType;
        orderId?: string;
        actorId?: string;
        note?: string;
    }): Promise<InventoryTransaction>;
    reserveStock(productId: string, variantSku: string, quantity: number, orderId: string): Promise<void>;
    releaseReservation(productId: string, variantSku: string, quantity: number, orderId: string): Promise<void>;
    fulfillStock(productId: string, variantSku: string, quantity: number, orderId: string): Promise<void>;
    returnStock(productId: string, variantSku: string, quantity: number, orderId: string, actorId?: string): Promise<void>;
    adjustStock(productId: string, variantSku: string, quantityChange: number, actorId?: string, note?: string, transactionType?: InventoryTransactionType): Promise<{
        success: boolean;
        productId: string;
        variantSku: string;
        previousStock: number;
        newStock: number;
        availableStock: number;
    }>;
    getTransactions(query: {
        productId?: string;
        type?: string;
        limit?: number;
    }): Promise<(import("mongoose").Document<unknown, {}, InventoryTransactionDocument, {}, import("mongoose").DefaultSchemaOptions> & InventoryTransaction & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getInventoryStatus(): Promise<{
        totalProducts: number;
        totalVariants: number;
        totalStockUnits: number;
        totalReservedUnits: number;
        totalAvailableUnits: number;
        outOfStockVariants: number;
        lowStockVariants: number;
        items: any[];
    }>;
}
