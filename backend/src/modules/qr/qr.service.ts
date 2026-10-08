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
import * as jwt from 'jsonwebtoken';
import { QrTokenService } from './qr-token.service';
import { QrScanEvent, QrScanEventDocument } from '../../schemas/qr-scan-event.schema';
import { IdempotencyKey, IdempotencyKeyDocument } from '../../schemas/idempotency-key.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { Order, OrderDocument, OrderStatus, FulfillmentMethod } from '../../schemas/order.schema';
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

  // Privacy Protection Masking Helpers
  private maskCustomerName(name?: string): string {
    if (!name) return 'Customer';
    const parts = name.trim().split(/\s+/);
    return parts
      .map((p) => {
        if (p.length <= 2) return p;
        return p[0] + '*'.repeat(Math.min(4, p.length - 2)) + p[p.length - 1];
      })
      .join(' ');
  }

  private maskPhoneNumber(phone?: string): string {
    if (!phone) return '01XXXXXXXXX';
    const clean = phone.replace(/[\s-]/g, '');
    if (clean.length < 8) return '01X****XXXX';
    return `${clean.slice(0, 3)}****${clean.slice(-4)}`;
  }

  private maskAddress(address?: string, district?: string): string {
    if (!address) return district ? `${district} (Details protected)` : 'Address protected';
    const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      const area = parts[parts.length - 1];
      return `${area}${district ? `, ${district}` : ''} (Street details protected)`;
    }
    return `${district || 'Location'} (Street details protected)`;
  }

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

    const frontendUrl = (this.configService.get<string>('FRONTEND_URL') || 'https://avelora-ecommerce.vercel.app').split(',')[0].trim();
    const resolveUrl = `${frontendUrl}/q/o/${encodeURIComponent(payload)}`;
    const qrDataUrl = await this.generateQrCodeDataUrl(resolveUrl);

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
    let clean = decodeURIComponent(rawPayload || '').trim();
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      try {
        const parsed = new URL(clean);
        const orderIdParam = parsed.searchParams.get('orderId');
        if (orderIdParam) {
          clean = orderIdParam;
        } else {
          const parts = parsed.pathname.split('/').filter(Boolean);
          if (parts.length > 0) clean = parts[parts.length - 1];
        }
      } catch {
        // ignore parse error
      }
    }
    clean = decodeURIComponent(clean).trim();

    let order: OrderDocument | null = null;
    let token: any = null;

    if (clean.startsWith('AV1:')) {
      try {
        token = await this.qrTokenService.verifyRawToken(clean);
        if (token.entityType === 'ORDER') {
          order = await this.orderModel.findById(token.entityId).exec();
        }
      } catch (err) {
        this.logger.debug(`Token verify failed, falling back: ${err.message}`);
      }
    }

    if (!order) {
      order = await this.orderModel.findOne({ orderId: clean.toUpperCase() }).exec();
    }
    if (!order && Types.ObjectId.isValid(clean)) {
      order = await this.orderModel.findById(clean).exec();
    }

    if (order) {
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
        purpose: token?.purpose || 'ORDER_TRACK',
        entityType: 'ORDER',
        entityId: (order as any)._id.toString(),
        orderSummary: {
          id: (order as any)._id,
          orderId: order.orderId,
          createdAt: (order as any).createdAt,
          customerName: order.customerDetails?.name,
          customerDistrict: order.customerDetails?.district,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          subtotal: order.subtotal,
          discount: order.discount,
          deliveryCharge: order.deliveryCharge,
          totalAmount: order.totalAmount,
          dueAmount: order.dueAmount,
          itemsCount: order.items?.length || 0,
          items: (order.items || []).map((i) => ({
            name: i.productName,
            sku: i.sku,
            variant: i.variant,
            color: i.color,
            size: i.size,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            lineTotal: (i.unitPrice || 0) * (i.quantity || 1),
          })),
        },
        allowedActions,
      };
    }

    if (clean.startsWith('PRD-') || Types.ObjectId.isValid(clean)) {
      const product = await this.productModel
        .findOne({ $or: [{ 'qr.publicCode': clean.toUpperCase() }, { _id: Types.ObjectId.isValid(clean) ? clean : null }] })
        .exec();
      if (product) {
        return {
          valid: true,
          purpose: 'PRODUCT_VIEW',
          entityType: 'PRODUCT',
          entityId: (product as any)._id.toString(),
          productSummary: {
            id: product._id,
            name: product.name,
            slug: product.slug,
            salePrice: product.salePrice,
          },
          allowedActions: ['VIEW_CATALOG'],
        };
      }
    }

    throw new NotFoundException(`No valid entity found for scanned payload "${clean}".`);
  }

  // 6b. Deep Order Details Resolution for QR Scans (Privacy-aware, mobile-optimized, print-ready)
  async resolveOrderQrDetails(
    rawInput: string,
    mobileQuery?: string,
    req?: any,
  ): Promise<{
    success: boolean;
    isAuthorized: boolean;
    authorizationType: 'ADMIN' | 'CUSTOMER' | 'ANONYMOUS';
    allowedActions: string[];
    order: any;
  }> {
    let clean = decodeURIComponent(rawInput || '').trim();
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      try {
        const parsed = new URL(clean);
        const orderIdParam = parsed.searchParams.get('orderId');
        if (orderIdParam) {
          clean = orderIdParam;
        } else {
          const parts = parsed.pathname.split('/').filter(Boolean);
          if (parts.length > 0) clean = parts[parts.length - 1];
        }
      } catch {
        // ignore parse error
      }
    }
    clean = decodeURIComponent(clean).trim();

    let order: OrderDocument | null = null;
    let tokenRecord: any = null;

    if (clean.startsWith('AV1:')) {
      try {
        tokenRecord = await this.qrTokenService.verifyRawToken(clean);
        if (tokenRecord?.entityType === 'ORDER') {
          order = await this.orderModel.findById(tokenRecord.entityId).exec();
        }
      } catch (err) {
        this.logger.debug(`Could not resolve token: ${err.message}`);
      }
    }

    if (!order) {
      order = await this.orderModel.findOne({ orderId: clean.toUpperCase() }).exec();
    }

    if (!order && Types.ObjectId.isValid(clean)) {
      order = await this.orderModel.findById(clean).exec();
    }

    if (!order) {
      throw new NotFoundException(`No order record could be found matching "${clean}".`);
    }

    // Authorization verification
    let isAuthorized = false;
    let authorizationType: 'ADMIN' | 'CUSTOMER' | 'ANONYMOUS' = 'ANONYMOUS';

    // 1. Check for valid Admin/Staff JWT token in Authorization header or cookie
    let authToken = req?.cookies?.token;
    if (!authToken && req?.headers?.authorization) {
      const header = req.headers.authorization;
      if (typeof header === 'string' && header.startsWith('Bearer ')) {
        authToken = header.substring(7).trim();
      }
    }

    if (authToken) {
      try {
        const secret = this.configService.get<string>('JWT_SECRET') || 'default_avelora_jwt_secret_key';
        const decoded: any = jwt.verify(authToken, secret);
        const privilegedRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'];
        if (decoded && privilegedRoles.includes(decoded.role)) {
          isAuthorized = true;
          authorizationType = 'ADMIN';
        }
      } catch {
        // Invalid or expired token; proceed to mobile verification
      }
    }

    // 2. Check for customer mobile verification
    if (!isAuthorized && mobileQuery && mobileQuery.trim()) {
      const normalize = (num: string) => num.replace(/[\s\-\+]/g, '').replace(/^880/, '0');
      const inputNorm = normalize(mobileQuery);
      const customerNorm = normalize(order.customerDetails?.mobile || '');
      const altNorm = normalize(order.customerDetails?.altMobile || '');

      if (
        inputNorm.length >= 8 &&
        (inputNorm === customerNorm ||
          inputNorm === altNorm ||
          customerNorm.endsWith(inputNorm) ||
          inputNorm.endsWith(customerNorm))
      ) {
        isAuthorized = true;
        authorizationType = 'CUSTOMER';
      }
    }

    // Determine allowed actions
    const allowedActions: string[] = [];
    if (isAuthorized && authorizationType === 'ADMIN') {
      if (order.status === OrderStatus.PROCESSING || order.status === OrderStatus.CONFIRMED) {
        allowedActions.push('MARK_SHIPPED');
      } else if (order.status === OrderStatus.SHIPPED) {
        allowedActions.push('MARK_DELIVERED');
      } else if (order.status === OrderStatus.PENDING) {
        allowedActions.push('CONFIRM_ORDER');
      }
    }

    const frontendUrl = (this.configService.get<string>('FRONTEND_URL') || 'https://avelora-ecommerce.vercel.app').split(',')[0].trim();
    const qrVerifyUrl = `${frontendUrl}/q/o/${encodeURIComponent(order.orderId)}`;
    const qrCodeDataUrl = await this.generateQrCodeDataUrl(qrVerifyUrl, { width: 400 });

    const formattedOrder = {
      id: (order as any)._id,
      orderId: order.orderId,
      createdAt: (order as any).createdAt || new Date(),
      status: order.status,
      fulfillmentStatus: order.fulfillmentStatus || 'UNFULFILLED',
      fulfillmentMethod: order.fulfillmentMethod,
      deliveryMethodLabel:
        order.fulfillmentMethod === FulfillmentMethod.SHOWROOM_PICKUP
          ? 'Showroom Pickup'
          : order.fulfillmentMethod === FulfillmentMethod.CUSTOMER_PICKUP
          ? 'Customer Pickup Point'
          : 'Home Delivery',
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      paymentProvider: order.paymentProvider || order.paymentMethod,
      senderMobile: isAuthorized ? order.senderMobile : this.maskPhoneNumber(order.senderMobile),
      transactionId: order.transactionId || '',
      courier: order.courier || null,
      timeline: order.timeline || [],

      // Customer Details (protected if unauthorized)
      customer: {
        name: isAuthorized ? order.customerDetails?.name : this.maskCustomerName(order.customerDetails?.name),
        mobile: isAuthorized ? order.customerDetails?.mobile : this.maskPhoneNumber(order.customerDetails?.mobile),
        altMobile: isAuthorized ? (order.customerDetails?.altMobile || '') : '',
        email: isAuthorized ? (order.customerDetails?.email || '') : '',
        address: isAuthorized
          ? order.customerDetails?.address
          : this.maskAddress(order.customerDetails?.address, order.customerDetails?.district),
        district: order.customerDetails?.district || 'Dhaka',
        division: order.customerDetails?.division || 'Dhaka',
        upazila: isAuthorized ? (order.customerDetails?.upazila || '') : '',
        union: isAuthorized ? (order.customerDetails?.union || '') : '',
        notes: isAuthorized ? (order.notes || '') : (order.notes ? 'Customer notes recorded' : ''),
      },

      // Product Breakdown
      items: (order.items || []).map((item) => {
        const unitPrice = Number(item.unitPrice) || 0;
        const qty = Number(item.quantity) || 1;
        return {
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage || '',
          sku: item.sku,
          variant: item.variant || '',
          color: item.color || '',
          size: item.size || '',
          quantity: qty,
          unitPrice: unitPrice,
          lineTotal: unitPrice * qty,
        };
      }),

      // Payment Summary
      financials: {
        subtotal: Number(order.subtotal) || 0,
        discount: Number(order.discount) || 0,
        couponDiscount: Number(order.couponDiscount) || 0,
        couponCode: order.couponCode || '',
        deliveryCharge: Number(order.deliveryCharge) || 0,
        totalAmount: Number(order.totalAmount) || 0,
        paidAmount: Number(order.paidAmount) || 0,
        dueAmount: Number(order.dueAmount) || 0,
      },

      // Verification QR metadata
      qrCodeDataUrl,
      qrVerifyUrl,
    };

    return {
      success: true,
      isAuthorized,
      authorizationType,
      allowedActions,
      order: formattedOrder,
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
