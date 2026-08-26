"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuditLogService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const audit_log_schema_1 = require("../../schemas/audit-log.schema");
let AuditLogService = AuditLogService_1 = class AuditLogService {
    auditLogModel;
    logger = new common_1.Logger(AuditLogService_1.name);
    constructor(auditLogModel) {
        this.auditLogModel = auditLogModel;
    }
    async logAction(params) {
        try {
            return await this.auditLogModel.create({
                adminId: params.adminId ? new mongoose_2.Types.ObjectId(params.adminId) : undefined,
                action: params.action,
                entityType: params.entityType,
                entityId: params.entityId,
                oldData: params.oldData,
                newData: params.newData,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
            });
        }
        catch (err) {
            this.logger.warn(`Failed to write audit log: ${err.message}`);
            return null;
        }
    }
    async getLogs(query) {
        const filter = {};
        if (query.entityType)
            filter.entityType = query.entityType;
        if (query.entityId)
            filter.entityId = query.entityId;
        const limit = Math.max(1, Math.min(200, Number(query.limit) || 100));
        return this.auditLogModel
            .find(filter)
            .populate('adminId', 'name email role')
            .sort({ timestamp: -1 })
            .limit(limit)
            .exec();
    }
};
exports.AuditLogService = AuditLogService;
exports.AuditLogService = AuditLogService = AuditLogService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(audit_log_schema_1.AuditLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AuditLogService);
//# sourceMappingURL=audit-log.service.js.map