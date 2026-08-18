import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../schemas/user.schema';

@Controller('admin/inventory')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.STAFF)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('status')
  async getInventoryStatus() {
    return this.inventoryService.getInventoryStatus();
  }

  @Get('transactions')
  async getTransactions(@Query() query: any) {
    return this.inventoryService.getTransactions(query);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)
  @Post('adjust')
  async adjustStock(
    @Body() body: { productId: string; variantSku: string; quantityChange: number; note?: string },
  ) {
    return this.inventoryService.adjustStock(
      body.productId,
      body.variantSku,
      body.quantityChange,
      body.note,
    );
  }
}
