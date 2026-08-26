import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../schemas/user.schema';
import type { Response } from 'express';

@Controller('api/admin/finance')
@UseGuards(AuthGuard, RolesGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('analytics')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async getAnalytics() {
    return this.financeService.getFinancialAnalytics();
  }

  @Get('pnl')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getDetailedPnL(@Query() query: { from?: string; to?: string }) {
    return this.financeService.getDetailedPnL(query);
  }

  @Get('cash-flow')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getCashFlow() {
    return this.financeService.getCashFlow();
  }

  @Get('inventory-valuation')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async getInventoryValuation() {
    return this.financeService.getInventoryValuation();
  }

  @Get('reconciliation')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getReconciliation() {
    return this.financeService.getReconciliation();
  }

  @Get('expenses')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async getExpenses(@Query() query: { category?: string; limit?: number }) {
    return this.financeService.getExpenses(query);
  }

  @Post('expenses')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async createExpense(@Body() body: any, @Request() req: any) {
    const actor = req.user?.email || 'ADMIN';
    return this.financeService.createExpense(body, actor);
  }

  @Delete('expenses/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async deleteExpense(@Param('id') id: string, @Request() req: any) {
    const actor = req.user?.email || 'ADMIN';
    return this.financeService.deleteExpense(id, actor);
  }

  @Get('export/:type')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async exportReport(@Param('type') type: string, @Res() res: Response) {
    const csvData = await this.financeService.exportReportCsv(type);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="avelora-${type}-report-${Date.now()}.csv"`);
    return res.send(csvData);
  }
}
