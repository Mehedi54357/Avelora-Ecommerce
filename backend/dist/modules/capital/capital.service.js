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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapitalService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const capital_schema_1 = require("../../schemas/capital.schema");
const audit_log_service_1 = require("../audit-log/audit-log.service");
let CapitalService = class CapitalService {
    capitalModel;
    auditLogService;
    constructor(capitalModel, auditLogService) {
        this.capitalModel = capitalModel;
        this.auditLogService = auditLogService;
    }
    async getTransactions(query) {
        const filter = {};
        if (query.type)
            filter.type = query.type;
        const limit = Math.max(1, Math.min(200, Number(query.limit) || 100));
        return this.capitalModel.find(filter).sort({ date: -1, createdAt: -1 }).limit(limit).exec();
    }
    async createTransaction(data, actor = 'ADMIN') {
        const amount = Number(data.amount) || 0;
        if (amount <= 0) {
            throw new common_1.BadRequestException('Amount must be greater than zero');
        }
        const tx = await this.capitalModel.create({
            type: data.type || capital_schema_1.CapitalTransactionType.OWNER_CAPITAL_IN,
            amount,
            source: data.source || 'Owner',
            account: data.account || 'Bank Account',
            date: data.date ? new Date(data.date) : new Date(),
            reference: data.reference || '',
            notes: data.notes || '',
            recordedBy: actor,
        });
        await this.auditLogService.logAction({
            action: 'CAPITAL_TRANSACTION_RECORDED',
            entityType: 'CapitalTransaction',
            entityId: tx._id.toString(),
            newData: {
                type: tx.type,
                amount: tx.amount,
                source: tx.source,
                actor,
            },
        });
        return tx;
    }
    async deleteTransaction(id, actor = 'ADMIN') {
        const tx = await this.capitalModel.findByIdAndDelete(id).exec();
        if (!tx)
            throw new common_1.NotFoundException('Capital transaction not found');
        await this.auditLogService.logAction({
            action: 'CAPITAL_TRANSACTION_DELETED',
            entityType: 'CapitalTransaction',
            entityId: id,
            newData: {
                type: tx.type,
                amount: tx.amount,
                actor,
            },
        });
        return { success: true };
    }
    async getCapitalSummary() {
        const all = await this.capitalModel.find().exec();
        let totalCapitalIn = 0;
        let totalWithdrawals = 0;
        let totalLoansIn = 0;
        let totalLoansRepaid = 0;
        for (const tx of all) {
            if (tx.type === capital_schema_1.CapitalTransactionType.OWNER_CAPITAL_IN) {
                totalCapitalIn += tx.amount || 0;
            }
            else if (tx.type === capital_schema_1.CapitalTransactionType.OWNER_WITHDRAWAL) {
                totalWithdrawals += tx.amount || 0;
            }
            else if (tx.type === capital_schema_1.CapitalTransactionType.LOAN_IN) {
                totalLoansIn += tx.amount || 0;
            }
            else if (tx.type === capital_schema_1.CapitalTransactionType.LOAN_REPAYMENT) {
                totalLoansRepaid += tx.amount || 0;
            }
        }
        const netCapital = totalCapitalIn - totalWithdrawals;
        const netLoans = totalLoansIn - totalLoansRepaid;
        return {
            totalCapitalIn,
            totalWithdrawals,
            netCapital,
            totalLoansIn,
            totalLoansRepaid,
            netLoans,
            totalEquityAndDebt: netCapital + netLoans,
            recentTransactions: all.slice(-10).reverse(),
        };
    }
};
exports.CapitalService = CapitalService;
exports.CapitalService = CapitalService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(capital_schema_1.CapitalTransaction.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        audit_log_service_1.AuditLogService])
], CapitalService);
//# sourceMappingURL=capital.service.js.map