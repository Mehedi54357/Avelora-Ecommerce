import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../schemas/user.schema';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Public: Checkout Order
  @Post('checkout')
  async checkout(@Body() body: any) {
    return this.ordersService.checkout(body);
  }

  // Public: Secure Order Tracking (Requires both Order Reference ID and Mobile Number)
  @Get('track')
  async trackOrder(@Query('orderId') orderId: string, @Query('mobile') mobile: string) {
    return this.ordersService.trackOrder(orderId, mobile);
  }

  // Admin: Get All Orders with Pagination & Filters
  @Get('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async getAdminOrders(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.ordersService.getAdminOrders({ status, search, page, limit });
  }

  // Admin: Get Single Order Details
  @Get('admin/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  // Admin: Update Status Transition (State Machine)
  @Patch('admin/:id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: any; paymentStatus?: any; note?: string },
    @Req() req: any,
  ) {
    const actor = req.user?.name || req.user?.role || 'STAFF';
    return this.ordersService.updateOrderStatus(id, body.status, body.paymentStatus, actor, body.note);
  }

  // Admin: Update Payment Details
  @Patch('admin/:id/payment')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async updatePaymentDetails(@Param('id') id: string, @Body() body: any) {
    return this.ordersService.updatePaymentDetails(id, body);
  }

  // Admin: Update Courier Consignment
  @Patch('admin/:id/courier')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async updateCourier(@Param('id') id: string, @Body() body: any) {
    return this.ordersService.updateCourierDetails(id, body);
  }

  // Admin: Process Return & Refund
  @Post('admin/:id/return')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async processReturn(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const actorId = req.user?.sub;
    return this.ordersService.processReturn(id, { ...body, actorId });
  }
}
