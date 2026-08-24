import { Controller, Get, Put, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../schemas/user.schema';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Public: Get Store Settings (Name, Social, Delivery Charges)
  @Get('public')
  async getPublicSettings() {
    const settings = await this.settingsService.getSettings();
    return {
      storeName: settings.storeName,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
      storeAddress: settings.storeAddress,
      codEnabled: settings.codEnabled,
      mobileBankingEnabled: settings.mobileBankingEnabled,
      returnWindowDays: settings.returnWindowDays,
      defaultDhakaDeliveryCharge: settings.defaultDhakaDeliveryCharge,
      defaultOutsideDhakaDeliveryCharge: settings.defaultOutsideDhakaDeliveryCharge,
    };
  }

  // Public: Calculate Delivery Charge for checkout
  @Get('delivery-charge')
  async calculateDelivery(
    @Query('district') district: string,
    @Query('subtotal') subtotal: number,
  ) {
    return this.settingsService.calculateDeliveryCharge(district, Number(subtotal) || 0);
  }

  // Admin: Get Full Settings
  @Get('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getAdminSettings() {
    return this.settingsService.getSettings();
  }

  // Admin: Update Settings
  @Put('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async updateAdminSettings(@Body() body: any) {
    return this.settingsService.updateSettings(body);
  }

  // Admin: Delivery Zones
  @Get('admin/delivery-zones')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async getDeliveryZones() {
    return this.settingsService.getDeliveryZones();
  }

  @Post('admin/delivery-zones')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async createDeliveryZone(@Body() body: any) {
    return this.settingsService.createDeliveryZone(body);
  }

  @Put('admin/delivery-zones/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async updateDeliveryZone(@Param('id') id: string, @Body() body: any) {
    return this.settingsService.updateDeliveryZone(id, body);
  }

  @Delete('admin/delivery-zones/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async deleteDeliveryZone(@Param('id') id: string) {
    return this.settingsService.deleteDeliveryZone(id);
  }
}
