import { PurchasesService } from './purchases.service';
export declare class PurchasesController {
    private readonly purchasesService;
    constructor(purchasesService: PurchasesService);
    getSuppliers(): Promise<(import("mongoose").Document<unknown, {}, import("../../schemas/supplier.schema").SupplierDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/supplier.schema").Supplier & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    createSupplier(body: any, req: any): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/supplier.schema").SupplierDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/supplier.schema").Supplier & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateSupplier(id: string, body: any, req: any): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/supplier.schema").SupplierDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/supplier.schema").Supplier & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    deleteSupplier(id: string, req: any): Promise<{
        success: boolean;
    }>;
    getPurchaseOrders(query: any): Promise<(import("mongoose").Document<unknown, {}, import("../../schemas/purchase.schema").PurchaseOrderDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/purchase.schema").PurchaseOrder & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getPurchaseOrderById(id: string): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/purchase.schema").PurchaseOrderDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/purchase.schema").PurchaseOrder & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    createPurchaseOrder(body: any, req: any): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/purchase.schema").PurchaseOrderDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/purchase.schema").PurchaseOrder & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    receiveGoods(id: string, req: any): Promise<{
        success: boolean;
        message: string;
        purchaseOrder: import("mongoose").Document<unknown, {}, import("../../schemas/purchase.schema").PurchaseOrderDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/purchase.schema").PurchaseOrder & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
}
