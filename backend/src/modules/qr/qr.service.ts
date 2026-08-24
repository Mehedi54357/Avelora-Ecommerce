import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as QRCode from 'qrcode';
import { QrTokenService } from './qr-token.service';
import { QrScanEvent, QrScanEventDocument } from '../../schemas/qr-scan-event.schema';
import { IdempotencyKey, IdempotencyKeyDocument } from '../../schemas/idempotency-key.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { Order, OrderDocument, OrderStatus } from '../../schemas/order.schema';
import { QrPurpose } from '../../schemas/qr-token.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QrService {
  private readonly logger = new Logger(QrService.name);

  constructor(
    private readonly qrTokenService: QrTokenService,
    @InjectModel(QrScanEvent.name) private qrScanEventModel: Model<QrScanEventDocument>,
    @InjectModel(IdempotencyKey.name) private idempotencyKeyModel: Model<IdempotencyKeyDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly configService: ConfigService,
  ) {}

  // 1. Generate QR Code Image (Data URL / SVG / PNG)
  async generateQrCodeDataUrl(payload: string, options?: { margin?: number; width?: number }): Promise<string> {
    return QRCode.toDataURL(payload, {
      margin: options?.margin || 2,
      width: options?.width || 300,
      color: {
        dark: '#0B0F19',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
  }

  async generateQrCodeSvg(payload: string): Promise<string> {
    return QRCode.toString(payload, {
      type: 'svg',
      margin: 2,
      color: {
        dark: '#0B0F19',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
  }

  // 2. Stable Product QR (PRD-XXXXX)
  async getOrCreateProductQr(productId: string): Promise<{ publicCode: string; qrDataUrl: string; resolveUrl: string }> {
    const product = await this.productModel.findById(productId).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let publicCode = product.qr?.publicCode;
    if (!publicCode || publicCode.trim() === '') {
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      publicCode = `PRD-${randomSuffix}`;
      product.qr = {
        enabled: true,
        publicCode,
        generatedAt: new Date(),
      };
      await product.save();
    }

    const frontendUrl = (this.configService.get<string>('FRONTEND_URL') || 'https://avelora-ecommerce.vercel.app').split(',')[0].trim();
    const resolveUrl = `${frontendUrl}/q/p/${publicCode}`;
    const qrDataUrl = await this.generateQrCodeDataUrl(resolveUrl);

    return { publicCode, qrDataUrl, resolveUrl };
  }

  // 3. Resolve Product from Public Code (Used by /q/p/:code)
  async resolveProductByPublicCode(publicCode: string): Promise<{ id: string; name: string; slug: string }> {
    const cleanCode = publicCode.trim().toUpperCase();
    const product = await this.productModel.findOne({ 'qr.publicCode': cleanCode }).select('name slug isPublished').exec();

    if (!product) {
      throw new NotFoundException(`Product with QR code "${cleanCode}" not found`);
    }

    return {
      id: (product as any)._id.toString(),
      name: product.name,
      slug: product.slug,
    };
  }

  // 4. Issue Order Fulfillment QR (AV1:F:...)
  async issueOrderFulfillmentQr(orderId: string, adminId?: string): Promise<{ tokenId: string; payload: string; qrDataUrl: string; expiresAt: Date }> {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const { token, payload } = await this.qrTokenService.createToken({
      entityType: 'ORDER',
      entityId: (order as any)._id.toString(),
      purpose: QrPurpose.FULFILL_SHIPMENT,
      expiresInSeconds: 604800, // 7 days
      oneTime: true,
      issuedBy: adminId,
      metadata: { orderReferenceId: order.orderId },
    });

    order.qr = {
      labelVersion: (order.qr?.labelVersion || 0) + 1,
      lastIssuedAt: new Date(),
    };
    await order.save();

    const qrDataUrl = await this.generateQrCodeDataUrl(payload);

    return {
      tokenId: (token as any)._id.toString(),
      payload,
      qrDataUrl,
      expiresAt: token.expiresAt,
    };
  }

  // 5. Issue Customer Tracking QR (AV1:T:...)
  async issueCustomerTrackingQr(orderId: string): Promise<{ payload: string; qrDataUrl: string; trackUrl: string }> {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const { payload } = await this.qrTokenService.createToken({
      entityType: 'ORDER',
      entityId: (order as any)._id.toString(),
      purpose: QrPurpose.ORDER_TRACK,
      expiresInSeconds: 2592000, // 30 days
      oneTime: false,
      prefix: 'AV1:T:',
      metadata: { orderReferenceId: order.orderId },
    });

    const frontendUrl = (this.configService.get<string>('FRONTEND_URL') || 'https://avelora-ecommerce.vercel.app').split(',')[0].trim();
    const trackUrl = `${frontendUrl}/q/o/${encodeURIComponent(payload)}`;
    const qrDataUrl = await this.generateQrCodeDataUrl(trackUrl);

    return { payload, qrDataUrl, trackUrl };
  }

  // 6. Verify Scanned QR (Verification only - No state changes)
  async verifyScannedQr(rawPayload: string): Promise<{
    valid: boolean;
    purpose: string;
    entityType: string;
    entityId: string;
    orderSummary?: any;
    productSummary?: any;
    allowedActions: string[];
  }> {
    const token = await this.qrTokenService.verifyRawToken(rawPayload);

    if (token.entityType === 'ORDER') {
      const order = await this.orderModel.findById(token.entityId).exec();
      if (!order) {
        throw new NotFoundException('Target order record not found');
      }

      // Determine permitted actions based on current status
      const allowedActions: string[] = [];
      if (order.status === OrderStatus.PROCESSING || order.status === OrderStatus.CONFIRMED) {
        allowedActions.push('MARK_SHIPPED');
      } else if (order.status === OrderStatus.SHIPPED) {
        allowedActions.push('MARK_DELIVERED');
      } else if (order.status === OrderStatus.PENDING) {
        allowedActions.push('CONFIRM_ORDER');
      }

      return {
        valid: true,
        purpose: token.purpose,
        entityType: 'ORDER',
        entityId: token.entityId.toString(),
        orderSummary: {
          id: (order as any)._id,
          orderId: order.orderId,
          customerName: order.customerDetails?.name,
          customerDistrict: order.customerDetails?.district,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          totalAmount: order.totalAmount,
          dueAmount: order.dueAmount,
          itemsCount: order.items?.length || 0,
          items: order.items.map((i) => ({
            name: i.productName,
            sku: i.sku,
            variant: i.variant,
            quantity: i.quantity,
          })),
        },
        allowedActions,
      };
    }

    if (token.entityType === 'PRODUCT') {
      const product = await this.productModel.findById(token.entityId).exec();
      return {
        valid: true,
        purpose: token.purpose,
        entityType: 'PRODUCT',
        entityId: token.entityId.toString(),
        productSummary: {
          id: product?._id,
          name: product?.name,
          slug: product?.slug,
          salePrice: product?.salePrice,
        },
        allowedActions: ['VIEW_CATALOG'],
      };
    }

    return {
      valid: true,
      purpose: token.purpose,
      entityType: token.entityType,
      entityId: token.entityId.toString(),
      allowedActions: [],
    };
  }

  // 7. Atomic QR Fulfillment (Consumes token + transitions Order status + logs event)
  async fulfillOrderQr(
    rawPayload: string,
    action: string,
    actorId?: string,
    actorRole = 'STAFF',
    idempotencyKey?: string,
    ordersServiceTransitionFn?: (orderId: string, nextStatus: OrderStatus, actor?: string, note?: string) => Promise<any>,
  ) {
    // 1. Idempotency Check
    if (idempotencyKey) {
      const existingIdempotency = await this.idempotencyKeyModel
        .findOne({ scope: 'qr.fulfill', key: idempotencyKey })
        .exec();
      if (existingIdempotency && existingIdempotency.state === 'COMPLETED') {
        this.logger.log(`Idempotent fulfillment replay for key: ${idempotencyKey}`);
        return existingIdempotency.responseBody;
      }
    }

    // 2. Verify token
    const token = await this.qrTokenService.verifyRawToken(rawPayload, QrPurpose.FULFILL_SHIPMENT);
    const order = await this.orderModel.findById(token.entityId).exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const previousStatus = order.status;
    let nextStatus: OrderStatus = OrderStatus.SHIPPED;

    if (action === 'MARK_DELIVERED') {
      nextStatus = OrderStatus.DELIVERED;
    } else if (action === 'MARK_SHIPPED') {
      nextStatus = OrderStatus.SHIPPED;
    } else if (action === 'CONFIRM_ORDER') {
      nextStatus = OrderStatus.CONFIRMED;
    }

    // 3. Atomically consume token
    await this.qrTokenService.consumeToken((token as any)._id.toString(), actorId);

    // 4. Transition Order Status
    let updatedOrder: any = order;
    if (ordersServiceTransitionFn) {
      updatedOrder = await ordersServiceTransitionFn(
        (order as any)._id.toString(),
        nextStatus,
        actorRole,
        `Fulfilled via QR Scanner (${action})`,
      );
    } else {
      order.status = nextStatus;
      order.timeline.push({
        status: nextStatus,
        at: new Date(),
        actor: actorRole,
        note: `Fulfilled via QR Scanner (${action})`,
      });
      updatedOrder = await order.save();
    }

    // 5. Log QR Scan Audit Event
    const eventId = `QSE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    await this.qrScanEventModel.create({
      eventId,
      tokenId: (token as any)._id as any,
      entityType: 'ORDER',
      entityId: (order as any)._id as any,
      actorId: actorId && Types.ObjectId.isValid(actorId) ? (new Types.ObjectId(actorId) as any) : undefined,
      actorRole,
      action,
      result: 'SUCCESS',
      previousStatus,
      newStatus: nextStatus,
      source: 'CAMERA',
      idempotencyKey,
    });

    const result = {
      success: true,
      eventId,
      orderId: order.orderId,
      previousStatus,
      newStatus: nextStatus,
      fulfilledAt: new Date().toISOString(),
    };

    // 6. Record completed idempotency
    if (idempotencyKey) {
      try {
        await this.idempotencyKeyModel.create({
          scope: 'qr.fulfill',
          actorId: actorId && Types.ObjectId.isValid(actorId) ? (new Types.ObjectId(actorId) as any) : undefined,
          key: idempotencyKey,
          requestHash: this.qrTokenService.hashToken(rawPayload + action),
          state: 'COMPLETED',
          responseStatus: 200,
          responseBody: result,
          expiresAt: new Date(Date.now() + 86400 * 1000), // 24 hour expiry
        });
      } catch (e) {
        this.logger.warn(`Non-critical idempotency logging warning: ${e.message}`);
      }
    }

    return result;
  }

  // 8. QR Scan Audit History
  async getScanEvents(query: { limit?: number; entityId?: string; actorId?: string }) {
    const filter: any = {};
    if (query.entityId) filter.entityId = new Types.ObjectId(query.entityId);
    if (query.actorId) filter.actorId = new Types.ObjectId(query.actorId);

    const limit = Math.max(1, Math.min(200, Number(query.limit) || 50));
    return this.qrScanEventModel
      .find(filter)
      .populate('actorId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}
