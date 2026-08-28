import { Model, Types } from 'mongoose';
import { Supplier, SupplierDocument } from '../../schemas/supplier.schema';
import { PurchaseOrder, PurchaseOrderDocument } from '../../schemas/purchase.schema';
import { ProductDocument } from '../../schemas/product.schema';
import { InventoryTransactionDocument } from '../../schemas/inventory-transaction.schema';
import { AuditLogService } from '../audit-log/audit-log.service';
export declare class PurchasesService {
    private supplierModel;
    private purchaseModel;
    private productModel;
    private transactionModel;
    private auditLogService;
    constructor(supplierModel: Model<SupplierDocument>, purchaseModel: Model<PurchaseOrderDocument>, productModel: Model<ProductDocument>, transactionModel: Model<InventoryTransactionDocument>, auditLogService: AuditLogService);
    getSuppliers(): Promise<(import("mongoose").Document<unknown, {}, SupplierDocument, {}, import("mongoose").DefaultSchemaOptions> & Supplier & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    createSupplier(data: Partial<Supplier>, actor?: string): Promise<import("mongoose").Document<unknown, {}, SupplierDocument, {}, import("mongoose").DefaultSchemaOptions> & Supplier & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateSupplier(id: string, data: Partial<Supplier>, actor?: string): Promise<import("mongoose").Document<unknown, {}, SupplierDocument, {}, import("mongoose").DefaultSchemaOptions> & Supplier & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    deleteSupplier(id: string, actor?: string): Promise<{
        success: boolean;
    }>;
    getPurchaseOrders(query: {
        status?: string;
        supplierId?: string;
    }): Promise<(import("mongoose").Document<unknown, {}, PurchaseOrderDocument, {}, import("mongoose").DefaultSchemaOptions> & PurchaseOrder & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getPurchaseOrderById(id: string): Promise<import("mongoose").Document<unknown, {}, PurchaseOrderDocument, {}, import("mongoose").DefaultSchemaOptions> & PurchaseOrder & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    createPurchaseOrder(data: any, actor?: string): Promise<import("mongoose").Document<unknown, {}, PurchaseOrderDocument, {}, import("mongoose").DefaultSchemaOptions> & PurchaseOrder & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    receiveGoods(purchaseOrderId: string, actor?: string): Promise<{
        success: boolean;
        message: string;
        purchaseOrder: import("mongoose").Document<unknown, {}, PurchaseOrderDocument, {}, import("mongoose").DefaultSchemaOptions> & PurchaseOrder & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
}
