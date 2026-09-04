import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Order,
  OrderDocument,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
  FulfillmentMethod,
  CourierSettlementStatus,
} from '../../schemas/order.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { Customer, CustomerDocument } from '../../schemas/customer.schema';
import { Payment, PaymentDocument } from '../../schemas/payment.schema';
import { InventoryService } from '../inventory/inventory.service';
import { CouponsService } from '../coupons/coupons.service';
import { SettingsService } from '../settings/settings.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { evaluateProductPricing } from '../products/products.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private readonly inventoryService: InventoryService,
    private readonly couponsService: CouponsService,
    private readonly settingsService: SettingsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  // 1. Authoritative Checkout Calculation & Order Creation
  async checkout(data: {
    customerDetails: {
      name: string;
      mobile: string;
      altMobile?: string;
      address: string;
      division?: string;
      district: string;
      upazila?: string;
      union?: string;
    };
    items: Array<{ productId: string; sku: string; quantity: number }>;
    paymentMethod?: string;
    paymentProvider?: string;
    senderMobile?: string;
    transactionId?: string;
    paidAmount?: number;
    couponCode?: string;
    notes?: string;
    dataMode?: string;
    fulfillmentMethod?: FulfillmentMethod;
  }) {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    if (!data.customerDetails?.name || !data.customerDetails?.mobile || !data.customerDetails?.address) {
      throw new BadRequestException('Complete customer details (name, mobile, address) are required');
    }

    // Normalize phone number (handle +880 or 880 prefix)
    const cleanMobile = data.customerDetails.mobile.trim().replace(/[\s-]/g, '');
    const isTestData = data.dataMode === 'TEST';
    const chosenFulfillment = data.fulfillmentMethod || FulfillmentMethod.COURIER;

    // 1. Authoritative Line Item Verification & Snapshot Extraction
    const orderItems: any[] = [];
    let subtotal = 0;
    let totalDiscount = 0;

    for (const reqItem of data.items) {
      const product = await this.productModel.findById(reqItem.productId).exec();
      if (!product || product.status === 'ARCHIVED' || (!isTestData && product.dataMode === 'TEST')) {
        throw new NotFoundException(`Product not found or unavailable`);
      }

      const variant = product.variants.find((v) => v.sku === reqItem.sku);
      if (!variant) {
        throw new NotFoundException(`Variant with SKU "${reqItem.sku}" not found for product "${product.name}"`);
      }

      const availableStock = (variant.stockQuantity || 0) - (variant.reservedQuantity || 0);
      if (availableStock < reqItem.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${product.name} (${variant.color || ''} ${variant.size || ''})". Available: ${Math.max(0, availableStock)}, Requested: ${reqItem.quantity}`,
        );
      }

      // Always calculate using database prices (never trust client-supplied prices)
      const pricing = evaluateProductPricing(product);
      const baseProductPrice = pricing.effectivePrice;
      const unitPrice = variant.price > 0 ? variant.price : baseProductPrice;
      const costPrice = variant.weightedAverageCost || variant.costPrice || 0;
      const discount = pricing.hasDiscount ? pricing.savingAmount : 0;

      const itemTotal = unitPrice * reqItem.quantity;
      subtotal += itemTotal;
      totalDiscount += discount * reqItem.quantity;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        productImage: variant.image || (product.productImages && product.productImages[0]?.url) || (product.images && product.images[0]) || '',
        sku: variant.sku,
        variant: `${variant.color || ''} ${variant.size || ''}`.trim() || 'Standard',
        color: variant.color || '',
        size: variant.size || '',
        quantity: reqItem.quantity,
        unitPrice,
        costPrice,
        discount,
      });
    }

    // 2. Authoritative Coupon Validation & Calculation
    let couponDiscount = 0;
    let appliedCouponCode = '';

    if (data.couponCode && data.couponCode.trim() !== '') {
      try {
        const couponRes = await this.couponsService.validateCoupon(data.couponCode, subtotal);
        if (couponRes && couponRes.valid && couponRes.discountAmount > 0) {
          couponDiscount = couponRes.discountAmount;
          appliedCouponCode = couponRes.code;
        }
      } catch (couponErr: any) {
        this.logger.warn(`Coupon evaluation note: ${couponErr.message}`);
      }
    }

    // 3. Authoritative Delivery Zone Charge Calculation
    const districtLower = (data.customerDetails.district || '').trim().toLowerCase();
    const isDhaka =
      districtLower.includes('dhaka') ||
      districtLower === 'dhaka' ||
      (data.customerDetails.division || '').trim().toLowerCase().includes('dhaka');

    const storeSettings = await this.settingsService.getSettings();
    const deliveryCharge = chosenFulfillment === FulfillmentMethod.CUSTOMER_PICKUP
      ? 0
      : isDhaka
        ? (storeSettings.defaultDhakaDeliveryCharge || 70)
        : (storeSettings.defaultOutsideDhakaDeliveryCharge || 130);

    // 4. Final Total Calculation
    const taxableSubtotal = Math.max(0, subtotal - couponDiscount);
    const totalAmount = taxableSubtotal + deliveryCharge;

    // 5. Payment Details
    const paymentMethod = data.paymentMethod || 'COD';
    const paymentProvider = data.paymentProvider || (paymentMethod === 'COD' ? 'CashOnDelivery' : 'bKash');
    const senderMobile = data.senderMobile ? data.senderMobile.trim() : '';
    const transactionId = data.transactionId ? data.transactionId.trim() : '';
    const paidAmount = Number(data.paidAmount) || 0;
    const isAdvancePaid = paidAmount > 0;
    const dueAmount = Math.max(0, totalAmount - paidAmount);

    // 6. Generate Unique Order ID
    const today = new Date();
    const yyyymmdd = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderId = isTestData
      ? `TST-${yyyymmdd}-${randomSuffix}`
      : `AVE-${yyyymmdd}-${randomSuffix}`;

    // 7. Atomically Reserve Stock on Shelf
    for (const item of orderItems) {
      await this.inventoryService.reserveStock(
        item.productId.toString(),
        item.sku,
        item.quantity,
        orderId,
      );
    }

    // 8. Find or Update Customer Profile (for production orders)
    let customer: any = null;
    if (!isTestData) {
      try {
        customer = await this.customerModel.findOne({ mobile: cleanMobile }).exec();
        if (!customer) {
          customer = await this.customerModel.create({
            name: data.customerDetails.name,
            mobile: cleanMobile,
            email: `${cleanMobile}@customer.avelora.com`,
            addresses: [
              {
                district: data.customerDetails.district || 'Dhaka',
                area: data.customerDetails.division || 'Dhaka',
                fullAddress: data.customerDetails.address || '',
              },
            ],
            totalOrders: 1,
            totalSpent: totalAmount,
          });
        } else {
          customer.totalOrders = (customer.totalOrders || 0) + 1;
          customer.totalSpent = (customer.totalSpent || 0) + totalAmount;
          await customer.save();
        }
      } catch (custErr: any) {
        this.logger.warn(`Customer profile notice: ${custErr.message}`);
      }
    }

    // 9. Initial Timeline
    const initialTimeline = [
      {
        status: OrderStatus.PENDING,
        at: new Date(),
        actor: isTestData ? 'ADMIN_TEST' : 'CUSTOMER',
        note: `Order created (${chosenFulfillment}). ${isAdvancePaid ? `Advance paid: ৳${paidAmount}` : 'Cash on Delivery'}`,
      },
    ];

    const initialPayments: any[] = [];
    if (paidAmount > 0) {
      initialPayments.push({
        amount: paidAmount,
        paymentMethod: paymentMethod,
        transactionReference: transactionId,
        account: paymentProvider,
        paymentDate: new Date(),
        recordedBy: isTestData ? 'ADMIN_TEST' : 'STOREFRONT_CHECKOUT',
        notes: 'Advance payment recorded at checkout',
      });
    }

    const orderDoc: any = {
      orderId,
      dataMode: isTestData ? 'TEST' : 'PRODUCTION',
      fulfillmentMethod: chosenFulfillment,
      courierSettlementStatus: chosenFulfillment === FulfillmentMethod.COURIER
        ? CourierSettlementStatus.AWAITING_SETTLEMENT
        : CourierSettlementStatus.NOT_APPLICABLE,
      customerId: customer?._id || undefined,
      customerDetails: {
        name: data.customerDetails.name,
        mobile: cleanMobile,
        altMobile: data.customerDetails.altMobile || '',
        address: data.customerDetails.address,
        division: data.customerDetails.division || 'Dhaka',
        district: data.customerDetails.district || 'Dhaka',
        upazila: data.customerDetails.upazila || '',
        union: data.customerDetails.union || '',
      },
      status: OrderStatus.PENDING,
      paymentStatus: paidAmount >= totalAmount ? PaymentStatus.PAID : (paidAmount > 0 ? PaymentStatus.PARTIALLY_PAID : PaymentStatus.UNPAID),
      fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
      paymentMethod,
      paymentProvider,
      paidAmount,
      dueAmount,
      senderMobile,
      transactionId,
      isAdvancePaid,
      manualPayments: initialPayments,
      items: orderItems,
      subtotal,
      discount: totalDiscount,
      couponCode: appliedCouponCode || undefined,
      couponDiscount: couponDiscount > 0 ? couponDiscount : 0,
      deliveryCharge,
      totalAmount,
      notes: data.notes || '',
      timeline: initialTimeline,
    };

    const order = await this.orderModel.create(orderDoc);

    // 10. Create Payment Record in Ledger if applicable
    if (paidAmount > 0) {
      try {
        await this.paymentModel.create({
          orderId: (order as any)._id,
          transactionId: transactionId || `TXN-${orderId}-${Date.now()}`,
          method: paymentMethod,
          provider: paymentProvider,
          amount: paidAmount,
          status: paidAmount >= totalAmount ? 'PAID' : 'PARTIAL',
        });
      } catch (payErr) {
        this.logger.warn(`Payment transaction log notice: ${payErr.message}`);
      }
    }

    // 11. Record Coupon Usage
    if (appliedCouponCode && !isTestData) {
      await this.couponsService.recordUsage(appliedCouponCode);
    }

    return order;
  }

  // 2. Secure Public Order Tracking
  async trackOrder(orderId: string, mobile: string) {
    if (!orderId?.trim() || !mobile?.trim()) {
      throw new BadRequestException('Both Order ID and Recipient Mobile Number are required for tracking verification.');
    }

    const cleanOrderId = orderId.trim().toUpperCase();
    const cleanMobile = mobile.trim().replace(/[\s-]/g, '');

    const order = await this.orderModel.findOne({ orderId: cleanOrderId }).exec();

    if (!order) {
      throw new NotFoundException(`No order found matching Reference ID "${cleanOrderId}".`);
    }

    const orderPhone = order.customerDetails?.mobile?.replace(/[\s-]/g, '');
    if (orderPhone !== cleanMobile && !orderPhone?.endsWith(cleanMobile) && !cleanMobile.endsWith(orderPhone || '')) {
      throw new UnauthorizedException('The mobile number provided does not match the recipient on this order.');
    }

    const rawPhone = order.customerDetails.mobile;
    const maskedMobile = rawPhone.length >= 11
      ? `${rawPhone.slice(0, 3)}****${rawPhone.slice(-4)}`
      : '01XXXXXXXXX';

    return {
      orderId: order.orderId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      fulfillmentMethod: order.fulfillmentMethod,
      paymentMethod: order.paymentMethod,
      createdAt: (order as any).createdAt,
      customerName: order.customerDetails.name,
      district: order.customerDetails.district,
      maskedMobile,
      items: order.items.map((i) => ({
        productName: i.productName,
        productImage: i.productImage,
        variant: i.variant,
        color: i.color,
        size: i.size,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      subtotal: order.subtotal,
      discount: order.discount,
      couponDiscount: order.couponDiscount || 0,
      deliveryCharge: order.deliveryCharge,
      totalAmount: order.totalAmount,
      paidAmount: order.paidAmount,
      dueAmount: order.dueAmount,
      courier: order.courier
        ? {
            provider: order.courier.provider,
            consignmentId: order.courier.consignmentId,
            trackingUrl: order.courier.trackingUrl,
          }
        : null,
      timeline: order.timeline || [],
    };
  }

  // 3. Admin: Smart Search & List Orders with Multi-Filters
  async getAdminOrders(query: {
    status?: string;
    paymentStatus?: string;
    fulfillmentMethod?: string;
    dataMode?: string;
    courier?: string;
    dateRange?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: any = {};

    // 1. Order Status Filter
    if (query.status && query.status !== 'ALL') {
      filter.status = query.status;
    }

    // 2. Payment Status Filter
    if (query.paymentStatus && query.paymentStatus !== 'ALL') {
      filter.paymentStatus = query.paymentStatus;
    }

    // 3. Fulfillment Method Filter
    if (query.fulfillmentMethod && query.fulfillmentMethod !== 'ALL') {
      filter.fulfillmentMethod = query.fulfillmentMethod;
    }

    // 4. Data Mode Isolation Filter (Default: Production only)
    if (query.dataMode === 'TEST') {
      filter.dataMode = 'TEST';
    } else if (query.dataMode === 'ALL') {
      // Show all data
    } else {
      // Default to production
      filter.dataMode = { $ne: 'TEST' };
    }

    // 5. Courier Provider Filter
    if (query.courier && query.courier !== 'ALL') {
      filter['courier.provider'] = { $regex: query.courier, $options: 'i' };
    }

    // 6. Date Range Filter
    if (query.dateRange && query.dateRange !== 'ALL') {
      const now = new Date();
      let fromDate: Date | null = null;
      let toDate: Date = new Date();
      toDate.setHours(23, 59, 59, 999);

      const range = query.dateRange.toUpperCase();
      if (range === 'TODAY') {
        fromDate = new Date();
        fromDate.setHours(0, 0, 0, 0);
      } else if (range === 'YESTERDAY') {
        fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        toDate.setHours(23, 59, 59, 999);
      } else if (range === '7D' || range === '7_DAYS') {
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        fromDate.setHours(0, 0, 0, 0);
      } else if (range === '30D' || range === '30_DAYS') {
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        fromDate.setHours(0, 0, 0, 0);
      } else if (range === 'THIS_MONTH') {
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        fromDate.setHours(0, 0, 0, 0);
      } else if (range === 'CUSTOM' && query.startDate) {
        fromDate = new Date(query.startDate);
        fromDate.setHours(0, 0, 0, 0);
        if (query.endDate) {
          toDate = new Date(query.endDate);
          toDate.setHours(23, 59, 59, 999);
        }
      }

      if (fromDate && !isNaN(fromDate.getTime())) {
        filter.createdAt = { $gte: fromDate, $lte: toDate };
      }
    }

    // 7. Smart Multi-Field Search Engine
    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const orClauses: any[] = [
        { orderId: { $regex: escapedTerm, $options: 'i' } },
        { 'customerDetails.name': { $regex: escapedTerm, $options: 'i' } },
        { 'customerDetails.email': { $regex: escapedTerm, $options: 'i' } },
        { 'customerDetails.mobile': { $regex: escapedTerm, $options: 'i' } },
        { 'customerDetails.altMobile': { $regex: escapedTerm, $options: 'i' } },
        { senderMobile: { $regex: escapedTerm, $options: 'i' } },
        { 'courier.consignmentId': { $regex: escapedTerm, $options: 'i' } },
        { 'courier.transactionRef': { $regex: escapedTerm, $options: 'i' } },
        { transactionId: { $regex: escapedTerm, $options: 'i' } },
        { 'manualPayments.transactionReference': { $regex: escapedTerm, $options: 'i' } },
        { 'items.sku': { $regex: escapedTerm, $options: 'i' } },
        { 'items.productName': { $regex: escapedTerm, $options: 'i' } },
      ];

      // Bangladesh Phone Normalization for all BD Operators (013, 017, 014, 019, 018, 016, 015)
      const digitsOnly = term.replace(/\D/g, '');
      if (digitsOnly.length >= 3) {
        let clean11 = '';
        if (digitsOnly.startsWith('880') && digitsOnly.length === 13) {
          clean11 = digitsOnly.slice(2);
        } else if (digitsOnly.length === 11 && digitsOnly.startsWith('01')) {
          clean11 = digitsOnly;
        } else if (digitsOnly.length === 10 && digitsOnly.startsWith('1')) {
          clean11 = `0${digitsOnly}`;
        }

        if (clean11) {
          const core9 = clean11.slice(2); // e.g. 712345678, 312345678, 412345678, etc.
          orClauses.push(
            { 'customerDetails.mobile': { $regex: clean11, $options: 'i' } },
            { 'customerDetails.mobile': { $regex: core9, $options: 'i' } },
            { 'customerDetails.altMobile': { $regex: clean11, $options: 'i' } },
            { 'customerDetails.altMobile': { $regex: core9, $options: 'i' } },
            { senderMobile: { $regex: clean11, $options: 'i' } },
            { senderMobile: { $regex: core9, $options: 'i' } },
          );
        } else {
          orClauses.push(
            { 'customerDetails.mobile': { $regex: digitsOnly, $options: 'i' } },
            { 'customerDetails.altMobile': { $regex: digitsOnly, $options: 'i' } },
            { senderMobile: { $regex: digitsOnly, $options: 'i' } },
          );
        }
      }

      filter.$or = orClauses;
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(200, Number(query.limit) || 50));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.orderModel.countDocuments(filter).exec(),
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getOrderById(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  // 4. Update Fulfillment Method
  async updateFulfillmentMethod(id: string, method: FulfillmentMethod, actorId?: string, actor = 'ADMIN') {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');

    if (order.courier?.consignmentId) {
      throw new BadRequestException(
        'This order is already booked with Pathao courier. Cancel courier booking before changing fulfillment method.',
      );
    }

    const oldMethod = order.fulfillmentMethod;
    order.fulfillmentMethod = method;

    if (method !== FulfillmentMethod.COURIER) {
      order.courierSettlementStatus = CourierSettlementStatus.NOT_APPLICABLE;
    }

    order.timeline.push({
      status: order.status,
      at: new Date(),
      actor,
      note: `Fulfillment method changed from ${oldMethod} to ${method}`,
    });

    await order.save();

    await this.auditLogService.logAction({
      adminId: actorId,
      action: 'FULFILLMENT_METHOD_CHANGED',
      entityType: 'ORDER',
      entityId: order.orderId,
      oldData: { fulfillmentMethod: oldMethod },
      newData: { fulfillmentMethod: method },
    });

    return order;
  }

  // 5. Direct Hand Delivery Confirmation (Delivery & Payment Decoupled)
  async confirmDirectDelivery(
    id: string,
    payload: {
      paymentReceived: boolean;
      amount?: number;
      paymentMethod?: string;
      transactionReference?: string;
      account?: string;
      notes?: string;
    },
    actorId?: string,
    actor = 'ADMIN',
  ) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');

    const oldStatus = order.status;

    // Fulfill stock reservation if not already delivered
    if (oldStatus !== OrderStatus.DELIVERED) {
      for (const item of order.items) {
        await this.inventoryService.fulfillStock(
          item.productId.toString(),
          item.sku,
          item.quantity,
          order.orderId,
        );
      }
    }

    order.status = OrderStatus.DELIVERED;
    order.fulfillmentStatus = FulfillmentStatus.DELIVERED;
    order.courierSettlementStatus = CourierSettlementStatus.NOT_APPLICABLE;

    // Payment Handling (Strictly Decoupled)
    if (payload.paymentReceived && Number(payload.amount) > 0) {
      const payAmount = Number(payload.amount);
      if (!order.manualPayments) order.manualPayments = [];

      order.manualPayments.push({
        amount: payAmount,
        paymentMethod: payload.paymentMethod || 'Cash',
        transactionReference: payload.transactionReference || '',
        account: payload.account || 'Cash On Hand',
        paymentDate: new Date(),
        recordedBy: actor,
        notes: payload.notes || 'Direct Delivery Payment',
      });

      order.paidAmount = (order.paidAmount || 0) + payAmount;
      order.dueAmount = Math.max(0, order.totalAmount - order.paidAmount);

      if (order.paidAmount >= order.totalAmount) {
        order.paymentStatus = PaymentStatus.PAID;
      } else {
        order.paymentStatus = PaymentStatus.PARTIALLY_PAID;
      }
    } else {
      // Unpaid or already partially paid
      order.dueAmount = Math.max(0, order.totalAmount - (order.paidAmount || 0));
      if (order.paidAmount === 0) {
        order.paymentStatus = PaymentStatus.UNPAID;
      } else if (order.paidAmount < order.totalAmount) {
        order.paymentStatus = PaymentStatus.PARTIALLY_PAID;
      }
    }

    order.timeline.push({
      status: OrderStatus.DELIVERED,
      at: new Date(),
      actor,
      note: `Direct Hand Delivery confirmed. Payment: ${payload.paymentReceived ? `৳${payload.amount} received (${payload.paymentMethod || 'Cash'})` : 'UNPAID / PENDING'}`,
    });

    await order.save();

    await this.auditLogService.logAction({
      adminId: actorId,
      action: 'DIRECT_DELIVERY_CONFIRMED',
      entityType: 'ORDER',
      entityId: order.orderId,
      newData: {
        paymentReceived: payload.paymentReceived,
        amount: payload.amount,
        paidAmount: order.paidAmount,
        dueAmount: order.dueAmount,
        paymentStatus: order.paymentStatus,
      },
    });

    return order;
  }

  // 6. Customer Pickup Confirmation
  async confirmCustomerPickup(
    id: string,
    payload: {
      paymentReceived: boolean;
      amount?: number;
      paymentMethod?: string;
      transactionReference?: string;
      account?: string;
      notes?: string;
    },
    actorId?: string,
    actor = 'ADMIN',
  ) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');

    const oldStatus = order.status;

    if (oldStatus !== OrderStatus.DELIVERED) {
      for (const item of order.items) {
        await this.inventoryService.fulfillStock(
          item.productId.toString(),
          item.sku,
          item.quantity,
          order.orderId,
        );
      }
    }

    order.status = OrderStatus.DELIVERED;
    order.fulfillmentStatus = FulfillmentStatus.DELIVERED;
    order.courierSettlementStatus = CourierSettlementStatus.NOT_APPLICABLE;

    if (payload.paymentReceived && Number(payload.amount) > 0) {
      const payAmount = Number(payload.amount);
      if (!order.manualPayments) order.manualPayments = [];

      order.manualPayments.push({
        amount: payAmount,
        paymentMethod: payload.paymentMethod || 'Cash',
        transactionReference: payload.transactionReference || '',
        account: payload.account || 'Cash On Hand',
        paymentDate: new Date(),
        recordedBy: actor,
        notes: payload.notes || 'Customer Pickup Payment',
      });

      order.paidAmount = (order.paidAmount || 0) + payAmount;
      order.dueAmount = Math.max(0, order.totalAmount - order.paidAmount);

      if (order.paidAmount >= order.totalAmount) {
        order.paymentStatus = PaymentStatus.PAID;
      } else {
        order.paymentStatus = PaymentStatus.PARTIALLY_PAID;
      }
    } else {
      order.dueAmount = Math.max(0, order.totalAmount - (order.paidAmount || 0));
      if (order.paidAmount === 0) {
        order.paymentStatus = PaymentStatus.UNPAID;
      } else if (order.paidAmount < order.totalAmount) {
        order.paymentStatus = PaymentStatus.PARTIALLY_PAID;
      }
    }

    order.timeline.push({
      status: OrderStatus.DELIVERED,
      at: new Date(),
      actor,
      note: `Customer Pickup completed. Payment: ${payload.paymentReceived ? `৳${payload.amount} received (${payload.paymentMethod || 'Cash'})` : 'UNPAID / PENDING'}`,
    });

    await order.save();

    await this.auditLogService.logAction({
      adminId: actorId,
      action: 'CUSTOMER_PICKUP_CONFIRMED',
      entityType: 'ORDER',
      entityId: order.orderId,
      newData: {
        paymentReceived: payload.paymentReceived,
        amount: payload.amount,
        paidAmount: order.paidAmount,
        dueAmount: order.dueAmount,
        paymentStatus: order.paymentStatus,
      },
    });

    return order;
  }

  // 7. Manual Payment Entry (Partial / Full Payment Recording)
  async recordOrderPayment(
    id: string,
    payload: {
      amount: number;
      paymentMethod: string;
      transactionReference?: string;
      account?: string;
      notes?: string;
    },
    actorId?: string,
    actor = 'ADMIN',
  ) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');

    const payAmount = Number(payload.amount);
    if (!payAmount || payAmount <= 0) {
      throw new BadRequestException('Payment amount must be strictly greater than 0.');
    }

    if (!order.manualPayments) order.manualPayments = [];

    // Idempotency check on transaction reference if provided
    if (payload.transactionReference && payload.transactionReference.trim()) {
      const isDuplicate = order.manualPayments.some(
        (p) => p.transactionReference === payload.transactionReference?.trim(),
      );
      if (isDuplicate) {
        throw new BadRequestException(
          `A payment with transaction reference "${payload.transactionReference}" has already been recorded.`,
        );
      }
    }

    order.manualPayments.push({
      amount: payAmount,
      paymentMethod: payload.paymentMethod || 'Cash',
      transactionReference: payload.transactionReference || '',
      account: payload.account || 'Cash On Hand',
      paymentDate: new Date(),
      recordedBy: actor,
      notes: payload.notes || '',
    });

    order.paidAmount = (order.paidAmount || 0) + payAmount;
    order.dueAmount = Math.max(0, order.totalAmount - order.paidAmount);

    if (order.paidAmount >= order.totalAmount) {
      order.paymentStatus = PaymentStatus.PAID;
    } else {
      order.paymentStatus = PaymentStatus.PARTIALLY_PAID;
    }

    order.timeline.push({
      status: order.status,
      at: new Date(),
      actor,
      note: `Payment of ৳${payAmount} recorded via ${payload.paymentMethod || 'Cash'}. Outstanding Due: ৳${order.dueAmount}`,
    });

    await order.save();

    await this.auditLogService.logAction({
      adminId: actorId,
      action: 'MANUAL_PAYMENT_CONFIRMED',
      entityType: 'ORDER',
      entityId: order.orderId,
      newData: {
        amountAdded: payAmount,
        totalPaid: order.paidAmount,
        totalDue: order.dueAmount,
        paymentStatus: order.paymentStatus,
      },
    });

    return order;
  }

  // 8. Finite State Machine Order Status Transitions
  async updateOrderStatus(
    id: string,
    newStatus: OrderStatus,
    paymentStatus?: PaymentStatus,
    actor = 'STAFF',
    note?: string,
  ) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const oldStatus = order.status;
    if (oldStatus === newStatus) {
      if (paymentStatus) {
        order.paymentStatus = paymentStatus;
        await order.save();
      }
      return order;
    }

    // 1. Transitioning to DELIVERED (Fulfilled):
    if (newStatus === OrderStatus.DELIVERED && oldStatus !== OrderStatus.DELIVERED) {
      for (const item of order.items) {
        await this.inventoryService.fulfillStock(
          item.productId.toString(),
          item.sku,
          item.quantity,
          order.orderId,
        );
      }
      order.fulfillmentStatus = FulfillmentStatus.DELIVERED;
      if (order.fulfillmentMethod === FulfillmentMethod.COURIER && order.paymentMethod === 'COD') {
        order.paymentStatus = PaymentStatus.PAID;
        order.paidAmount = order.totalAmount;
        order.dueAmount = 0;
      }
    }

    // 2. Transitioning to CANCELLED:
    else if (
      newStatus === OrderStatus.CANCELLED &&
      oldStatus !== OrderStatus.CANCELLED &&
      oldStatus !== OrderStatus.DELIVERED &&
      oldStatus !== OrderStatus.RETURNED
    ) {
      for (const item of order.items) {
        await this.inventoryService.releaseReservation(
          item.productId.toString(),
          item.sku,
          item.quantity,
          order.orderId,
        );
      }
      order.cancellationReason = note || 'Cancelled by staff';
    }

    // 3. Transitioning to RETURNED from DELIVERED:
    else if (newStatus === OrderStatus.RETURNED && oldStatus === OrderStatus.DELIVERED) {
      for (const item of order.items) {
        await this.inventoryService.returnStock(
          item.productId.toString(),
          item.sku,
          item.quantity,
          order.orderId,
        );
      }
      order.fulfillmentStatus = FulfillmentStatus.RETURNED;
    }

    // 4. Transitioning to SHIPPED:
    else if (newStatus === OrderStatus.SHIPPED) {
      order.fulfillmentStatus = FulfillmentStatus.SHIPPED;
    }

    // 5. Transitioning to PACKED:
    else if (newStatus === OrderStatus.PACKED) {
      order.fulfillmentStatus = FulfillmentStatus.PACKED;
    }

    // Append to immutable timeline
    order.status = newStatus;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    order.timeline.push({
      status: newStatus,
      at: new Date(),
      actor,
      note: note || `Order status updated from ${oldStatus} to ${newStatus}`,
    });

    await order.save();
    return order;
  }

  // 9. Admin Payment Verification and Update
  async updatePaymentDetails(
    id: string,
    data: {
      paymentStatus?: PaymentStatus;
      paidAmount?: number;
      dueAmount?: number;
      transactionId?: string;
      senderMobile?: string;
      isAdvancePaid?: boolean;
    },
  ) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (data.paymentStatus !== undefined) order.paymentStatus = data.paymentStatus;
    if (data.paidAmount !== undefined) order.paidAmount = data.paidAmount;
    if (data.dueAmount !== undefined) order.dueAmount = data.dueAmount;
    if (data.transactionId !== undefined) order.transactionId = data.transactionId;
    if (data.senderMobile !== undefined) order.senderMobile = data.senderMobile;
    if (data.isAdvancePaid !== undefined) order.isAdvancePaid = data.isAdvancePaid;

    await order.save();
    return order;
  }

  // 10. Courier Consignment Details
  async updateCourierDetails(
    id: string,
    data: {
      provider: string;
      consignmentId: string;
      trackingUrl?: string;
      charge?: number;
    },
  ) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.courier = {
      provider: data.provider,
      consignmentId: data.consignmentId,
      trackingUrl: data.trackingUrl || '',
      charge: data.charge || 0,
      bookedAt: new Date(),
    };

    order.timeline.push({
      status: 'COURIER_BOOKED',
      at: new Date(),
      actor: 'STAFF',
      note: `Booked with ${data.provider}. Consignment ID: ${data.consignmentId}`,
    });

    await order.save();
    return order;
  }

  // 11. Returns & Refunds Workflow
  async processReturn(
    id: string,
    data: {
      reason: string;
      refundAmount: number;
      restocked: boolean;
      refundMethod?: string;
      actorId?: string;
    },
  ) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (data.restocked && order.status === OrderStatus.DELIVERED) {
      for (const item of order.items) {
        await this.inventoryService.returnStock(
          item.productId.toString(),
          item.sku,
          item.quantity,
          order.orderId,
          data.actorId,
        );
      }
    }

    order.status = OrderStatus.RETURNED;
    order.fulfillmentStatus = FulfillmentStatus.RETURNED;
    if (data.refundAmount > 0) {
      order.paymentStatus = data.refundAmount >= order.paidAmount ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;
    }

    order.returnDetails = {
      reason: data.reason,
      returnedAt: new Date(),
      refundAmount: data.refundAmount,
      restocked: data.restocked,
      refundMethod: data.refundMethod || 'bKash',
    };

    order.timeline.push({
      status: OrderStatus.RETURNED,
      at: new Date(),
      actor: 'STAFF',
      note: `Return processed. Reason: ${data.reason}. Restocked: ${data.restocked ? 'Yes' : 'No'}. Refund: ৳${data.refundAmount}`,
    });

    await order.save();
    return order;
  }

  // 12. Reset TEST Order
  async resetTestOrder(id: string, actorId?: string, actor = 'ADMIN') {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');

    if (order.dataMode !== 'TEST') {
      throw new BadRequestException('Only verified TEST orders can be reset.');
    }

    // Release any reservations
    for (const item of order.items) {
      await this.inventoryService.releaseReservation(
        item.productId.toString(),
        item.sku,
        item.quantity,
        order.orderId,
      );
    }

    order.status = OrderStatus.PENDING;
    order.paymentStatus = PaymentStatus.UNPAID;
    order.fulfillmentStatus = FulfillmentStatus.UNFULFILLED;
    order.paidAmount = 0;
    order.dueAmount = order.totalAmount;
    order.manualPayments = [];

    order.timeline.push({
      status: OrderStatus.PENDING,
      at: new Date(),
      actor,
      note: 'Test order reset to initial state by administrator.',
    });

    await order.save();

    await this.auditLogService.logAction({
      adminId: actorId,
      action: 'TEST_ORDER_RESET',
      entityType: 'ORDER',
      entityId: order.orderId,
    });

    return order;
  }

  // 13. Delete TEST Order (Dependency-Aware Cleanup)
  async deleteTestOrder(id: string, actorId?: string) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');

    if (order.dataMode !== 'TEST') {
      throw new BadRequestException(
        'Production orders with financial/inventory history cannot be deleted. Cancel the order instead.',
      );
    }

    // Release any reserved stock
    for (const item of order.items) {
      await this.inventoryService.releaseReservation(
        item.productId.toString(),
        item.sku,
        item.quantity,
        order.orderId,
      );
    }

    // Delete payment records for this test order
    await this.paymentModel.deleteMany({ orderId: order._id } as any).exec();

    // Delete the order itself
    await this.orderModel.findByIdAndDelete(id).exec();

    await this.auditLogService.logAction({
      adminId: actorId,
      action: 'TEST_ORDER_DELETED',
      entityType: 'ORDER',
      entityId: order.orderId,
      oldData: { orderId: order.orderId, totalAmount: order.totalAmount },
    });

    return { success: true, message: 'Test order safely deleted and reservations released.' };
  }
}
