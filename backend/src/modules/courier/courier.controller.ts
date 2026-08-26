import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PathaoService } from './pathao.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../schemas/user.schema';

@Controller('api/admin/courier')
@UseGuards(AuthGuard, RolesGuard)
export class CourierController {
  constructor(private readonly pathaoService: PathaoService) {}

  @Get('pathao/stores')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async getStores() {
    return this.pathaoService.getStores();
  }

  @Get('pathao/cities')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async getCities() {
    return this.pathaoService.getCities();
  }

  @Get('pathao/cities/:cityId/zones')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async getZones(@Param('cityId') cityId: string) {
    return this.pathaoService.getZones(cityId);
  }

  @Get('pathao/zones/:zoneId/areas')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async getAreas(@Param('zoneId') zoneId: string) {
    return this.pathaoService.getAreas(zoneId);
  }

  @Post('pathao/price-plan')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async calculatePricePlan(@Body() body: any) {
    return this.pathaoService.calculatePricePlan(body);
  }

  @Post('pathao/orders/:orderId/book')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async bookOrder(
    @Param('orderId') orderId: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    const actorEmail = req.user?.email || 'ADMIN';
    return this.pathaoService.createOrder(orderId, body, actorEmail);
  }

  @Post('pathao/orders/:orderId/sync')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async syncOrderStatus(
    @Param('orderId') orderId: string,
    @Request() req: any,
  ) {
    const actorEmail = req.user?.email || 'ADMIN';
    return this.pathaoService.syncConsignmentStatus(orderId, actorEmail);
  }
}
