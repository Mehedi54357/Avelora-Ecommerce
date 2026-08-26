import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CapitalTransaction,
  CapitalTransactionDocument,
  CapitalTransactionType,
} from '../../schemas/capital.schema';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class CapitalService {
  constructor(
    @InjectModel(CapitalTransaction.name)
    private capitalModel: Model<CapitalTransactionDocument>,
    private auditLogService: AuditLogService,
  ) {}

  async getTransactions(query: { type?: string; limit?: number }) {
    const filter: any = {};
    if (query.type) filter.type = query.type;
    const limit = Math.max(1, Math.min(200, Number(query.limit) || 100));
    return this.capitalModel.find(filter).sort({ date: -1, createdAt: -1 }).limit(limit).exec();
  }

  async createTransaction(data: Partial<CapitalTransaction>, actor: string = 'ADMIN') {
    const amount = Number(data.amount) || 0;
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const tx = await this.capitalModel.create({
      type: data.type || CapitalTransactionType.OWNER_CAPITAL_IN,
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
      entityId: (tx as any)._id.toString(),
      newData: {
        type: tx.type,
        amount: tx.amount,
        source: tx.source,
        actor,
      },
    });

    return tx;
  }

  async deleteTransaction(id: string, actor: string = 'ADMIN') {
    const tx = await this.capitalModel.findByIdAndDelete(id).exec();
    if (!tx) throw new NotFoundException('Capital transaction not found');

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
      if (tx.type === CapitalTransactionType.OWNER_CAPITAL_IN) {
        totalCapitalIn += tx.amount || 0;
      } else if (tx.type === CapitalTransactionType.OWNER_WITHDRAWAL) {
        totalWithdrawals += tx.amount || 0;
      } else if (tx.type === CapitalTransactionType.LOAN_IN) {
        totalLoansIn += tx.amount || 0;
      } else if (tx.type === CapitalTransactionType.LOAN_REPAYMENT) {
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
}
