import { Controller, Get, Post, Param, Body, BadRequestException } from '@nestjs/common';
import { QrService } from './qr.service';

@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Get('products/:publicCode')
  async resolveProduct(@Param('publicCode') publicCode: string) {
    return this.qrService.resolveProductByPublicCode(publicCode);
  }

  @Post('orders/resolve')
  async resolveOrderTracking(@Body() body: { token: string }) {
    if (!body?.token) {
      throw new BadRequestException('Tracking token is required');
    }
    const result = await this.qrService.verifyScannedQr(body.token);
    return {
      success: true,
      order: result.orderSummary,
    };
  }
}
