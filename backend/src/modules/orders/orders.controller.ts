import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../schemas/user.schema';
import { OrderStatus, PaymentStatus } from '../../schemas/order.schema';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Public Checkout
  @Post('orders/checkout')
  async checkout(@Body() body: any) {
    return this.ordersService.checkout(body);
  }

  // Public Order Tracking (Requires Order ID + Mobile Number)
  @Post('orders/track')
  async trackOrderPost(@Body() body: { orderId: string; mobile: string }) {
    return this.ordersService.trackOrder(body.orderId, body.mobile);
  }

  @Get('orders/track')
  async trackOrderGet(@Query('orderId') orderId: string, @Query('mobile') mobile: string) {
    return this.ordersService.trackOrder(orderId, mobile);
  }

  // Admin Endpoints
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @Get('admin/orders')
  async getAdminOrders(@Query() query: any) {
    return this.ordersService.getAdminOrders(query);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @Get('admin/orders/:id')
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)
  @Put('admin/orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: OrderStatus; paymentStatus?: PaymentStatus },
  ) {
    return this.ordersService.updateOrderStatus(id, body.status, body.paymentStatus);
  }
}
