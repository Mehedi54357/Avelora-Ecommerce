import { Model } from 'mongoose';
import { CapitalTransaction, CapitalTransactionDocument } from '../../schemas/capital.schema';
import { AuditLogService } from '../audit-log/audit-log.service';
export declare class CapitalService {
    private capitalModel;
    private auditLogService;
    constructor(capitalModel: Model<CapitalTransactionDocument>, auditLogService: AuditLogService);
    getTransactions(query: {
        type?: string;
        limit?: number;
    }): Promise<(import("mongoose").Document<unknown, {}, CapitalTransactionDocument, {}, import("mongoose").DefaultSchemaOptions> & CapitalTransaction & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    createTransaction(data: Partial<CapitalTransaction>, actor?: string): Promise<import("mongoose").Document<unknown, {}, CapitalTransactionDocument, {}, import("mongoose").DefaultSchemaOptions> & CapitalTransaction & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
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
        recentTransactions: (import("mongoose").Document<unknown, {}, CapitalTransactionDocument, {}, import("mongoose").DefaultSchemaOptions> & CapitalTransaction & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
}
