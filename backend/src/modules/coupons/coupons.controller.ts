import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../schemas/user.schema';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  // Public: Check & Validate coupon for cart/checkout
  @Post('validate')
  async validateCoupon(@Body() body: { code: string; subtotal: number }) {
    return this.couponsService.validateCoupon(body.code, Number(body.subtotal) || 0);
  }

  // Admin CRUD
  @Get('admin/all')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async findAll() {
    return this.couponsService.findAll();
  }

  @Post('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async create(@Body() body: any) {
    return this.couponsService.create(body);
  }

  @Put('admin/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() body: any) {
    return this.couponsService.update(id, body);
  }

  @Delete('admin/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    return this.couponsService.delete(id);
  }
}
