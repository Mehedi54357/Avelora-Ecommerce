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
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../schemas/user.schema';

@Controller('admin/purchases')
@UseGuards(AuthGuard, RolesGuard)
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  // Suppliers
  @Get('suppliers')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async getSuppliers() {
    return this.purchasesService.getSuppliers();
  }

  @Post('suppliers')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async createSupplier(@Body() body: any, @Request() req: any) {
    const actor = req.user?.email || 'ADMIN';
    return this.purchasesService.createSupplier(body, actor);
  }

  @Put('suppliers/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async updateSupplier(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    const actor = req.user?.email || 'ADMIN';
    return this.purchasesService.updateSupplier(id, body, actor);
  }

  @Delete('suppliers/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async deleteSupplier(@Param('id') id: string, @Request() req: any) {
    const actor = req.user?.email || 'ADMIN';
    return this.purchasesService.deleteSupplier(id, actor);
  }

  // Purchase Orders & GRN
  @Get('orders')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async getPurchaseOrders(@Query() query: any) {
    return this.purchasesService.getPurchaseOrders(query);
  }

  @Get('orders/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async getPurchaseOrderById(@Param('id') id: string) {
    return this.purchasesService.getPurchaseOrderById(id);
  }

  @Post('orders')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async createPurchaseOrder(@Body() body: any, @Request() req: any) {
    const actor = req.user?.email || 'ADMIN';
    return this.purchasesService.createPurchaseOrder(body, actor);
  }

  @Post('orders/:id/receive')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async receiveGoods(@Param('id') id: string, @Request() req: any) {
    const actor = req.user?.email || 'ADMIN';
    return this.purchasesService.receiveGoods(id, actor);
  }
}
