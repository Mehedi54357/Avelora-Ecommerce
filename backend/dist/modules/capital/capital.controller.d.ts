import { CapitalService } from './capital.service';
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
}
