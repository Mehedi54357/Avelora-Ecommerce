import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../../schemas/audit-log.schema';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async logAction(params: {
    adminId?: string;
    action: string;
    entityType: string;
    entityId: string;
    oldData?: any;
    newData?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditLog | null> {
    try {
      return await this.auditLogModel.create({
        adminId: params.adminId ? (new Types.ObjectId(params.adminId) as any) : undefined,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldData: params.oldData,
        newData: params.newData,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });
    } catch (err: any) {
      this.logger.warn(`Failed to write audit log: ${err.message}`);
      return null;
    }
  }

  async getLogs(query: { entityType?: string; entityId?: string; limit?: number }) {
    const filter: any = {};
    if (query.entityType) filter.entityType = query.entityType;
    if (query.entityId) filter.entityId = query.entityId;

    const limit = Math.max(1, Math.min(200, Number(query.limit) || 100));

    return this.auditLogModel
      .find(filter)
      .populate('adminId', 'name email role')
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }
}
