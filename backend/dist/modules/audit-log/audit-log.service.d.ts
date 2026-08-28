import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../../schemas/audit-log.schema';
export declare class AuditLogService {
    private auditLogModel;
    private readonly logger;
    constructor(auditLogModel: Model<AuditLogDocument>);
    logAction(params: {
        adminId?: string;
        action: string;
        entityType: string;
        entityId: string;
        oldData?: any;
        newData?: any;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<AuditLog | null>;
    getLogs(query: {
        entityType?: string;
        entityId?: string;
        limit?: number;
    }): Promise<(import("mongoose").Document<unknown, {}, AuditLogDocument, {}, import("mongoose").DefaultSchemaOptions> & AuditLog & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
}
