import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../schemas/user.schema';
import { Expense } from '../../schemas/expense.schema';

@Controller('admin/finance')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('analytics')
  async getAnalytics() {
    return this.financeService.getFinancialAnalytics();
  }

  @Get('expenses')
  async getExpenses(@Query() query: any) {
    return this.financeService.getExpenses(query);
  }

  @Post('expenses')
  async createExpense(@Body() body: Partial<Expense>) {
    return this.financeService.createExpense(body);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete('expenses/:id')
  async deleteExpense(@Param('id') id: string) {
    return this.financeService.deleteExpense(id);
  }
}
