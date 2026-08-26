import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PathaoToken, PathaoTokenDocument } from '../../schemas/pathao-token.schema';
import { Order, OrderDocument, OrderStatus } from '../../schemas/order.schema';
import { AuditLogService } from '../audit-log/audit-log.service';

export interface PathaoOrderPayload {
  store_id: number;
  merchant_order_id: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_city: number;
  recipient_zone: number;
  recipient_area?: number;
  delivery_type: number; // 48: Normal, 12: On-Demand
  item_type: number; // 1: Document, 2: Parcel
  special_instruction?: string;
  item_quantity: number;
  item_weight: number; // in KG
  amount_to_collect: number;
  item_description: string;
}

@Injectable()
export class PathaoService {
  private readonly logger = new Logger(PathaoService.name);

  constructor(
    private configService: ConfigService,
    @InjectModel(PathaoToken.name) private tokenModel: Model<PathaoTokenDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private auditLogService: AuditLogService,
  ) {}

  private getBaseUrl(): string {
    const isSandbox = this.configService.get<string>('PATHAO_SANDBOX') !== 'false';
    const customUrl = this.configService.get<string>('PATHAO_BASE_URL');
    if (customUrl) return customUrl.replace(/\/$/, '');
    return isSandbox
      ? 'https://courier-api-sandbox.pathao.com'
      : 'https://api-hermes.pathao.com';
  }

  private getCredentials() {
    return {
      clientId: this.configService.get<string>('PATHAO_CLIENT_ID') || process.env.PATHAO_CLIENT_ID || '',
      clientSecret: this.configService.get<string>('PATHAO_CLIENT_SECRET') || process.env.PATHAO_CLIENT_SECRET || '',
      username: this.configService.get<string>('PATHAO_USERNAME') || process.env.PATHAO_USERNAME || '',
      password: this.configService.get<string>('PATHAO_PASSWORD') || process.env.PATHAO_PASSWORD || '',
    };
  }

  /**
   * Acquire or reuse valid OAuth access token (with automatic refresh)
   */
  async getValidAccessToken(): Promise<string> {
    let tokenDoc = await this.tokenModel.findOne({ key: 'primary' }).exec();

    // Check if token exists and has at least 5 minutes before expiry
    const now = new Date();
    if (tokenDoc && tokenDoc.accessToken && tokenDoc.expiresAt && tokenDoc.expiresAt.getTime() > now.getTime() + 300000) {
      return tokenDoc.accessToken;
    }

    // If refresh token exists, attempt refresh
    if (tokenDoc && tokenDoc.refreshToken) {
      try {
        const refreshed = await this.refreshAccessToken(tokenDoc.refreshToken);
        if (refreshed) return refreshed;
      } catch (err) {
        this.logger.warn(`Token refresh failed, re-issuing token: ${err.message}`);
      }
    }

    // Otherwise issue fresh token with credentials
    return this.issueNewToken();
  }

  /**
   * Issue new token using password grant
   */
  private async issueNewToken(): Promise<string> {
    const creds = this.getCredentials();
    if (!creds.clientId || !creds.clientSecret || !creds.username || !creds.password) {
      throw new BadRequestException(
        'Pathao Merchant credentials (PATHAO_CLIENT_ID, PATHAO_CLIENT_SECRET, PATHAO_USERNAME, PATHAO_PASSWORD) are not configured in environment.',
      );
    }

    const url = `${this.getBaseUrl()}/aladdin/api/v1/issue-token`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        username: creds.username,
        password: creds.password,
        grant_type: 'password',
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.access_token) {
      this.logger.error(`Pathao issue-token error: ${JSON.stringify(data)}`);
      throw new BadRequestException(data.message || 'Failed to authenticate with Pathao Merchant API');
    }

    const expiresAt = new Date(Date.now() + (data.expires_in || 3600) * 1000);

    await this.tokenModel.findOneAndUpdate(
      { key: 'primary' },
      {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || '',
        tokenType: data.token_type || 'Bearer',
        expiresAt,
      },
      { upsert: true, new: true },
    );

    return data.access_token;
  }

  /**
   * Refresh token
   */
  private async refreshAccessToken(refreshToken: string): Promise<string | null> {
    const creds = this.getCredentials();
    const url = `${this.getBaseUrl()}/aladdin/api/v1/issue-token`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.access_token) {
      return null;
    }

    const expiresAt = new Date(Date.now() + (data.expires_in || 3600) * 1000);

    await this.tokenModel.findOneAndUpdate(
      { key: 'primary' },
      {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        tokenType: data.token_type || 'Bearer',
        expiresAt,
      },
      { upsert: true },
    );

    return data.access_token;
  }

  /**
   * Fetch Merchant Stores
   */
  async getStores() {
    const token = await this.getValidAccessToken();
    const url = `${this.getBaseUrl()}/aladdin/api/v1/stores`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new BadRequestException(data.message || 'Failed to fetch Pathao stores');
    }
    return data.data?.data || data.data || [];
  }

  /**
   * Fetch City List (Country 1 = Bangladesh)
   */
  async getCities() {
    const token = await this.getValidAccessToken();
    const url = `${this.getBaseUrl()}/aladdin/api/v1/countries/1/city-list`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new BadRequestException(data.message || 'Failed to fetch Pathao cities');
    }
    return data.data?.data || data.data || [];
  }

  /**
   * Fetch Zones for a City
   */
  async getZones(cityId: number | string) {
    const token = await this.getValidAccessToken();
    const url = `${this.getBaseUrl()}/aladdin/api/v1/cities/${cityId}/zone-list`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new BadRequestException(data.message || 'Failed to fetch Pathao zones');
    }
    return data.data?.data || data.data || [];
  }

  /**
   * Fetch Areas for a Zone
   */
  async getAreas(zoneId: number | string) {
    const token = await this.getValidAccessToken();
    const url = `${this.getBaseUrl()}/aladdin/api/v1/zones/${zoneId}/area-list`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new BadRequestException(data.message || 'Failed to fetch Pathao areas');
    }
    return data.data?.data || data.data || [];
  }

  /**
   * Calculate Price Plan / Delivery Cost
   */
  async calculatePricePlan(payload: {
    store_id: number;
    item_type?: number;
    delivery_type?: number;
    item_weight?: number;
    recipient_city: number;
    recipient_zone: number;
  }) {
    const token = await this.getValidAccessToken();
    const url = `${this.getBaseUrl()}/aladdin/api/v1/merchant/price-plan`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        store_id: Number(payload.store_id),
        item_type: Number(payload.item_type || 2), // Parcel
        delivery_type: Number(payload.delivery_type || 48), // 48hr
        item_weight: Number(payload.item_weight || 0.5),
        recipient_city: Number(payload.recipient_city),
        recipient_zone: Number(payload.recipient_zone),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new BadRequestException(data.message || 'Failed to calculate Pathao delivery price');
    }
    return data.data || data;
  }

  /**
   * Create Single Order Booking with Pathao Courier
   */
  async createOrder(orderId: string, bookingData: {
    storeId: number;
    recipientCity: number;
    recipientZone: number;
    recipientArea?: number;
    itemWeight?: number;
    specialInstruction?: string;
  }, actorEmail: string = 'ADMIN') {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new BadRequestException('Order not found');
    }

    // Duplicate booking prevention
    if (order.courier?.consignmentId && order.courier?.provider === 'Pathao') {
      throw new BadRequestException(
        `Order is already booked with Pathao Consignment ID: ${order.courier.consignmentId}`,
      );
    }

    // Amount to collect calculation
    let amountToCollect = 0;
    if (order.paymentMethod === 'COD') {
      amountToCollect = order.dueAmount !== undefined ? order.dueAmount : order.subtotal;
    } else if (order.paymentStatus !== 'PAID') {
      amountToCollect = order.totalAmount;
    }

    // Item description
    const itemDesc = order.items.map((i) => `${i.productName} (${i.sku}) x${i.quantity}`).join(', ');
    const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);

    const payload: PathaoOrderPayload = {
      store_id: Number(bookingData.storeId),
      merchant_order_id: order.orderId,
      recipient_name: order.customerDetails?.name || 'Customer',
      recipient_phone: order.customerDetails?.mobile || '',
      recipient_address: `${order.customerDetails?.address || ''}, ${order.customerDetails?.district || ''}`,
      recipient_city: Number(bookingData.recipientCity),
      recipient_zone: Number(bookingData.recipientZone),
      recipient_area: bookingData.recipientArea ? Number(bookingData.recipientArea) : undefined,
      delivery_type: 48, // 48 Hour Delivery
      item_type: 2, // Parcel
      special_instruction: bookingData.specialInstruction || order.notes || 'Handle with care - Luxury Apparel',
      item_quantity: totalQty || 1,
      item_weight: Number(bookingData.itemWeight || 0.5),
      amount_to_collect: amountToCollect,
      item_description: itemDesc.slice(0, 250),
    };

    const token = await this.getValidAccessToken();
    const url = `${this.getBaseUrl()}/aladdin/api/v1/orders`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || (data.type && data.type !== 'success')) {
      this.logger.error(`Pathao order creation error: ${JSON.stringify(data)}`);
      throw new BadRequestException(data.message || 'Pathao booking rejected by provider');
    }

    const orderData = data.data || {};
    const consignmentId = orderData.consignment_id || orderData.order_id || '';
    const deliveryFee = Number(orderData.delivery_fee || 0);

    // Persist consignment details & update order
    order.courier = {
      provider: 'Pathao',
      consignmentId,
      trackingUrl: `https://pathao.com/courier/tracking/?consignment_id=${consignmentId}`,
      charge: deliveryFee || order.deliveryCharge || 0,
      deliveryFee,
      amountToCollect,
      storeId: Number(bookingData.storeId),
      pathaoStatus: orderData.order_status || 'Created',
      bookedAt: new Date(),
    };

    if (order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED || order.status === OrderStatus.PROCESSING) {
      order.status = OrderStatus.SHIPPED;
    }

    order.timeline.push({
      status: 'SHIPPED_PATHAO',
      at: new Date(),
      actor: actorEmail,
      note: `Booked with Pathao Consignment #${consignmentId}. COD to collect: ৳${amountToCollect}`,
    });

    await order.save();

    // Central Audit Log
    await this.auditLogService.logAction({
      action: 'PATHAO_ORDER_BOOKED',
      entityType: 'Order',
      entityId: (order as any)._id.toString(),
      newData: {
        orderId: order.orderId,
        consignmentId,
        amountToCollect,
        deliveryFee,
        actor: actorEmail,
      },
    });

    return {
      success: true,
      consignmentId,
      deliveryFee,
      trackingUrl: order.courier.trackingUrl,
      amountToCollect,
      order: order,
    };
  }

  /**
   * Get Consignment Info & Sync Live Delivery Status
   */
  async syncConsignmentStatus(orderId: string, actorEmail: string = 'ADMIN') {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order || !order.courier?.consignmentId) {
      throw new BadRequestException('Order does not have a Pathao consignment ID');
    }

    const consignmentId = order.courier.consignmentId;
    const token = await this.getValidAccessToken();
    const url = `${this.getBaseUrl()}/aladdin/api/v1/orders/${consignmentId}/info`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new BadRequestException(data.message || 'Failed to sync Pathao consignment status');
    }

    const info = data.data || {};
    const pathaoStatus = info.order_status || info.status || '';

    if (order.courier) {
      order.courier.pathaoStatus = pathaoStatus;
    }

    // Map Pathao courier status to Order FSM if appropriate
    const lower = pathaoStatus.toLowerCase();
    if (lower.includes('delivered') && order.status !== OrderStatus.DELIVERED) {
      order.status = OrderStatus.DELIVERED;
      order.paymentStatus = 'PAID' as any;
      order.timeline.push({
        status: 'DELIVERED',
        at: new Date(),
        actor: 'PATHAO_SYNC',
        note: `Pathao confirmed delivery for consignment #${consignmentId}`,
      });
    } else if (lower.includes('return') && order.status !== OrderStatus.RETURNED) {
      order.status = OrderStatus.RETURNED;
      order.timeline.push({
        status: 'RETURNED',
        at: new Date(),
        actor: 'PATHAO_SYNC',
        note: `Pathao reported return for consignment #${consignmentId}`,
      });
    }

    await order.save();

    await this.auditLogService.logAction({
      action: 'PATHAO_STATUS_SYNC',
      entityType: 'Order',
      entityId: (order as any)._id.toString(),
      newData: { consignmentId, pathaoStatus, newOrderStatus: order.status, actor: actorEmail },
    });

    return {
      consignmentId,
      pathaoStatus,
      orderStatus: order.status,
      details: info,
    };
  }
}
