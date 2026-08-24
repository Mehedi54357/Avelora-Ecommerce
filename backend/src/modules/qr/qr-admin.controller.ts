import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
  Headers,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { QrService } from './qr.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../schemas/user.schema';
import { OrdersService } from '../orders/orders.service';

@Controller('admin/qr')
@UseGuards(AuthGuard, RolesGuard)
export class QrAdminController {
  constructor(
    private readonly qrService: QrService,
    private readonly ordersService: OrdersService,
  ) {}

  // 1. Generate Product QR Code
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @Post('products/:id')
  async getProductQr(@Param('id') id: string) {
    return this.qrService.getOrCreateProductQr(id);
  }

  // 2. Issue Order Fulfillment QR Token
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @Post('orders/:id/fulfillment')
  async issueOrderFulfillmentQr(@Param('id') id: string, @Req() req: any) {
    const adminId = req.user?.sub;
    return this.qrService.issueOrderFulfillmentQr(id, adminId);
  }

  // 3. Issue Customer Tracking QR Token
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @Post('orders/:id/tracking')
  async issueCustomerTrackingQr(@Param('id') id: string) {
    return this.qrService.issueCustomerTrackingQr(id);
  }

  // 4. Verify Scanned QR (Camera / Upload / Manual input) - No state mutation
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @Post('verify')
  async verifyScannedQr(@Body() body: { raw: string }) {
    if (!body?.raw) {
      throw new BadRequestException('Scanned QR data is required');
    }
    return this.qrService.verifyScannedQr(body.raw);
  }

  // 5. Atomic QR Fulfillment (Consumes token + transitions order status + logs audit event)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @Post('fulfill')
  async fulfillOrder(
    @Body() body: { raw: string; action: string },
    @Headers('idempotency-key') idempotencyKey: string,
    @Req() req: any,
  ) {
    if (!body?.raw) {
      throw new BadRequestException('Scanned QR payload is required');
    }
    const actorId = req.user?.sub;
    const actorRole = req.user?.role || 'STAFF';

    return this.qrService.fulfillOrderQr(
      body.raw,
      body.action || 'MARK_SHIPPED',
      actorId,
      actorRole,
      idempotencyKey,
      (orderId, nextStatus, actor, note) => this.ordersService.updateOrderStatus(orderId, nextStatus, undefined, actor, note),
    );
  }

  // 6. Scan History & Audit Logs
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @Get('events')
  async getScanEvents(
    @Query('limit') limit?: number,
    @Query('entityId') entityId?: string,
    @Query('actorId') actorId?: string,
  ) {
    return this.qrService.getScanEvents({ limit, entityId, actorId });
  }
}
