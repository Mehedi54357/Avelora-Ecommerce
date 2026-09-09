import { InventoryService } from './inventory.service';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
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
    getTransactions(query: any): Promise<(import("mongoose").Document<unknown, {}, import("../../schemas/inventory-transaction.schema").InventoryTransactionDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/inventory-transaction.schema").InventoryTransaction & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    adjustStock(body: {
        productId: string;
        variantSku: string;
        quantityChange: number;
        note?: string;
    }): Promise<{
        success: boolean;
        productId: string;
        variantSku: string;
        previousStock: number;
        newStock: number;
        availableStock: number;
    }>;
}
