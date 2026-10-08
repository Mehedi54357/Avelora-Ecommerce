import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { CapitalService } from './capital.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../schemas/user.schema';
import type { Response } from 'express';

@Controller('admin/capital')
@UseGuards(AuthGuard, RolesGuard)
export class CapitalController {
  constructor(private readonly capitalService: CapitalService) {}

  @Get('summary')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getSummary() {
    return this.capitalService.getCapitalSummary();
  }

  @Get('transactions')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getTransactions(@Query() query: any) {
    return this.capitalService.getTransactions(query);
  }

  @Post('transactions')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async createTransaction(@Body() body: any, @Request() req: any) {
    const actor = req.user?.email || 'ADMIN';
    return this.capitalService.createTransaction(body, actor);
  }

  @Delete('transactions/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async deleteTransaction(@Param('id') id: string, @Request() req: any) {
    const actor = req.user?.email || 'ADMIN';
    return this.capitalService.deleteTransaction(id, actor);
  }

  // ================= PRODUCT-BASED INVESTMENT & COSTING =================

  @Get('investment-products')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async getInvestmentProductsSummary() {
    return this.capitalService.getInvestmentProductsSummary();
  }

  @Get('product-investments')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async getProductInvestments(@Query() query: any) {
    return this.capitalService.getProductInvestments(query);
  }

  @Get('product-investments/export')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async exportProductInvestments(@Query() query: any, @Res() res: Response) {
    const csvData = await this.capitalService.exportProductInvestmentsCsv(query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="avelora-investments-${Date.now()}.csv"`,
    );
    return res.send(csvData);
  }

  @Post('product-investments')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async createProductInvestment(@Body() body: any, @Request() req: any) {
    const actor = req.user?.email || 'ADMIN';
    return this.capitalService.createProductInvestment(body, actor);
  }

  @Put('product-investments/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async updateProductInvestment(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    const actor = req.user?.email || 'ADMIN';
    return this.capitalService.updateProductInvestment(id, body, actor);
  }

  @Delete('product-investments/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async deleteProductInvestment(@Param('id') id: string, @Request() req: any) {
    const actor = req.user?.email || 'ADMIN';
    return this.capitalService.deleteProductInvestment(id, actor);
  }

  // ================= DAMAGE & LOST STOCK ADJUSTMENT =================

  @Post('stock-adjust')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async adjustDamagedOrLostStock(@Body() body: any, @Request() req: any) {
    const actor = req.user?.email || 'ADMIN';
    return this.capitalService.adjustDamagedOrLostStock(body, actor);
  }
}
