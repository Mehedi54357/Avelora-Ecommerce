import { Controller, Get, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../schemas/user.schema';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Public: Get Gateway Readiness & Method Info
  @Get('status')
  getGatewayStatus() {
    return this.paymentsService.getGatewayStatus();
  }

  // Server-to-Server IPN / Webhook Callback (Public/Provider authenticated)
  @Post('ipn')
  async processIpn(@Body() body: any) {
    return this.paymentsService.processPaymentIpn({
      transactionId: body.tran_id || body.transactionId || body.trxID,
      orderId: body.tran_id || body.orderId || body.order_id,
      amount: Number(body.amount) || Number(body.val_id) || 0,
      currency: body.currency || 'BDT',
      status: body.status || (body.status_code === '0000' ? 'VALID' : 'FAILED'),
      provider: body.card_issuer || body.provider || 'SSLCOMMERZ',
    });
  }

  // Admin Refund
  @Post('admin/refund')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async processRefund(@Body() body: { paymentId: string; amount: number; reason: string }) {
    return this.paymentsService.processRefund(body.paymentId, body.amount, body.reason);
  }
}
