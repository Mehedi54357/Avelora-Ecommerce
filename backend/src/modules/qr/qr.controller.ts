import { Controller, Get, Post, Param, Body, BadRequestException, Req } from '@nestjs/common';
import { QrService } from './qr.service';

@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Get('products/:publicCode')
  async resolveProduct(@Param('publicCode') publicCode: string) {
    return this.qrService.resolveProductByPublicCode(publicCode);
  }

  @Post('orders/resolve')
  async resolveOrderTracking(
    @Body() body: { token: string; mobile?: string },
    @Req() req: any,
  ) {
    if (!body?.token) {
      throw new BadRequestException('Tracking token or order ID is required');
    }
    const result = await this.qrService.resolveOrderQrDetails(body.token, body.mobile, req);
    return {
      success: true,
      isAuthorized: result.isAuthorized,
      authorizationType: result.authorizationType,
      allowedActions: result.allowedActions,
      order: result.order,
      orderSummary: result.order,
    };
  }
}

