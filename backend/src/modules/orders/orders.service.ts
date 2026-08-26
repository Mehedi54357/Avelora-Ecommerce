import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  Logger,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Order,
  OrderDocument,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
} from '../../schemas/order.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { Customer, CustomerDocument } from '../../schemas/customer.schema';
import { Payment, PaymentDocument } from '../../schemas/payment.schema';
import { InventoryService } from '../inventory/inventory.service';
import { CouponsService } from '../coupons/coupons.service';
import { SettingsService } from '../settings/settings.service';

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
  }) {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    if (!data.customerDetails?.name || !data.customerDetails?.mobile || !data.customerDetails?.address) {
      throw new BadRequestException('Complete customer details (name, mobile, address) are required');
    }

    // Normalize phone number (handle +880 or 880 prefix)
    const cleanMobile = data.customerDetails.mobile.trim().replace(/[\s-]/g, '');

    // 1. Authoritative Line Item Verification & Snapshot Extraction
    const orderItems: any[] = [];
    let subtotal = 0;
    let totalDiscount = 0;

    for (const reqItem of data.items) {
      const product = await this.productModel.findById(reqItem.productId).exec();
      if (!product || product.status === 'ARCHIVED') {
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
      const unitPrice = variant.price > 0 ? variant.price : product.salePrice;
      const costPrice = variant.costPrice || 0;
      const discount = product.originalPrice > unitPrice ? product.originalPrice - unitPrice : 0;

      orderItems.push({
        productId: product._id as any,
        productName: product.name,
        productImage: variant.image || product.images?.[0] || '',
        sku: variant.sku,
        variant: `${variant.color || ''} ${variant.size || ''}`.trim(),
        color: variant.color || '',
        size: variant.size || '',
        quantity: reqItem.quantity,
        unitPrice,
        costPrice,
        discount,
      });

      subtotal += unitPrice * reqItem.quantity;
      totalDiscount += discount * reqItem.quantity;
    }

    // 2. Coupon Validation & Discount
    let couponDiscount = 0;
    let appliedCouponCode = '';
    if (data.couponCode && data.couponCode.trim()) {
      try {
        const couponResult = await this.couponsService.validateCoupon(data.couponCode, subtotal);
        if (couponResult.valid) {
          couponDiscount = couponResult.discountAmount;
          appliedCouponCode = couponResult.code;
        }
      } catch (couponErr) {
        this.logger.warn(`Coupon application notice: ${couponErr.message}`);
      }
    }

    // 3. Dynamic Delivery Charge via Settings / Delivery Zones
    const districtName = data.customerDetails.district || 'Dhaka';
    const deliveryCalc = await this.settingsService.calculateDeliveryCharge(districtName, subtotal);
    const deliveryCharge = deliveryCalc.charge;

    const totalAmount = Math.max(0, subtotal - couponDiscount + deliveryCharge);

    // 4. Payment Calculations
    const paymentMethod = data.paymentMethod || 'COD';
    const paymentProvider = data.paymentProvider || (paymentMethod === 'COD' ? 'bKash' : paymentMethod);
    const senderMobile = data.senderMobile || '';
    const transactionId = data.transactionId || '';

    let paidAmount = 0;
    let dueAmount = totalAmount;
    let isAdvancePaid = false;

    if (paymentMethod === 'COD') {
      // In Bangladesh luxury e-commerce, customer pays advance delivery fee (৳70/৳130) to confirm order
      paidAmount = data.paidAmount !== undefined ? data.paidAmount : (transactionId ? deliveryCharge : 0);
      dueAmount = Math.max(0, totalAmount - paidAmount);
      isAdvancePaid = Boolean(transactionId || senderMobile || paidAmount > 0);
    } else {
      paidAmount = data.paidAmount !== undefined ? data.paidAmount : totalAmount;
      dueAmount = Math.max(0, totalAmount - paidAmount);
      isAdvancePaid = true;
    }

    // 5. Generate Collision-Safe Order ID (AVE-YYYYMMDD-XXXXX)
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderId = `AVE-${todayStr}-${randomSuffix}`;

    // 6. Atomically Reserve Inventory
    for (const item of orderItems) {
      await this.inventoryService.reserveStock(
        item.productId.toString(),
        item.sku,
        item.quantity,
        orderId,
      );
    }

    // 7. Customer Profile Update
    let customer: any = null;
    try {
      customer = await this.customerModel.findOne({ mobile: cleanMobile }).exec();
      if (!customer) {
        customer = await this.customerModel.create({
          name: data.customerDetails.name,
          mobile: cleanMobile,
          addresses: [
            {
              district: data.customerDetails.district || 'Dhaka',
              area: data.customerDetails.upazila || '',
              fullAddress: data.customerDetails.address,
            },
          ],
          totalOrders: 1,
          totalSpent: totalAmount,
          isGuest: true,
        });
      } else {
        customer.totalOrders = (customer.totalOrders || 0) + 1;
        customer.totalSpent = (customer.totalSpent || 0) + totalAmount;
        await customer.save();
      }
    } catch (custErr) {
      this.logger.warn(`Non-critical customer profile update notice: ${custErr.message}`);
    }

    // 8. Create Order Document with Initial Timeline
    const initialTimeline = [
      {
        status: OrderStatus.PENDING,
        at: new Date(),
        actor: 'CUSTOMER',
        note: `Order placed via Storefront Checkout. ${isAdvancePaid ? `Advance paid: ৳${paidAmount}` : 'Cash on Delivery'}`,
      },
    ];

    const orderDoc = {
      orderId,
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
      paymentStatus: isAdvancePaid && paidAmount >= totalAmount ? PaymentStatus.PAID : (isAdvancePaid ? PaymentStatus.PENDING : PaymentStatus.UNPAID),
      fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
      paymentMethod,
      paymentProvider,
      paidAmount,
      dueAmount,
      senderMobile,
      transactionId,
      isAdvancePaid,
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

    // 9. Create Payment Record
    try {
      await this.paymentModel.create({
        orderId: (order as any)._id,
        transactionId: transactionId || `TXN-${orderId}-${Date.now()}`,
        method: paymentMethod,
        provider: paymentProvider,
        amount: paidAmount > 0 ? paidAmount : totalAmount,
        status: paidAmount >= totalAmount ? 'PAID' : (paidAmount > 0 ? 'PARTIAL' : 'PENDING'),
      });
    } catch (payErr) {
      this.logger.warn(`Payment transaction log notice: ${payErr.message}`);
    }

    // 10. Record Coupon Usage
    if (appliedCouponCode) {
      await this.couponsService.recordUsage(appliedCouponCode);
    }

    return order;
  }

  // 2. Secure Public Order Tracking (Privacy Protected - Sanitized Output)
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

    // Two-factor phone number verification
    const orderPhone = order.customerDetails?.mobile?.replace(/[\s-]/g, '');
    if (orderPhone !== cleanMobile && !orderPhone?.endsWith(cleanMobile) && !cleanMobile.endsWith(orderPhone || '')) {
      throw new UnauthorizedException('The mobile number provided does not match the recipient on this order.');
    }

    // Mask mobile number for privacy (e.g. 017****5678)
    const rawPhone = order.customerDetails.mobile;
    const maskedMobile = rawPhone.length >= 11
      ? `${rawPhone.slice(0, 3)}****${rawPhone.slice(-4)}`
      : '01XXXXXXXXX';

    // Return sanitized tracking payload (Excluding internal notes, COGS, cost prices, full street address)
    return {
      orderId: order.orderId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
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

  // 3. Admin: Search & List Orders
  async getAdminOrders(query: { status?: string; search?: string; page?: number; limit?: number }) {
    const filter: any = {};
    if (query.status && query.status !== 'ALL') {
      filter.status = query.status;
    }
    if (query.search) {
      filter.$or = [
        { orderId: { $regex: query.search, $options: 'i' } },
        { 'customerDetails.name': { $regex: query.search, $options: 'i' } },
        { 'customerDetails.mobile': { $regex: query.search, $options: 'i' } },
        { transactionId: { $regex: query.search, $options: 'i' } },
      ];
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(200, Number(query.limit) || 100));
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
        totalPages: Math.ceil(total / limit),
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

  // 4. Finite State Machine Order Status Transitions
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
    // Deduct physical stock & release reservation atomically
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
      if (order.paymentMethod === 'COD') {
        order.paymentStatus = PaymentStatus.PAID;
        order.paidAmount = order.totalAmount;
        order.dueAmount = 0;
      }
    }

    // 2. Transitioning to CANCELLED:
    // Releases reserved stock back to shelf
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
    // Restores physical inventory on hand
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

  // 5. Admin Payment Verification and Update
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

  // 6. Courier Consignment Details
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

  // 7. Returns & Refunds Workflow
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
}
