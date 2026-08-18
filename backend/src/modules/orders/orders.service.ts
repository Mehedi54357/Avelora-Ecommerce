import { Injectable, NotFoundException, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus, PaymentStatus } from '../../schemas/order.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { Customer, CustomerDocument } from '../../schemas/customer.schema';
import { Payment, PaymentDocument } from '../../schemas/payment.schema';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private inventoryService: InventoryService,
  ) {}

  async checkout(data: {
    customerDetails: { name: string; mobile: string; address: string; district: string };
    items: Array<{ productId: string; sku: string; quantity: number }>;
    paymentMethod?: string;
    deliveryCharge?: number;
    notes?: string;
  }) {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    if (!data.customerDetails?.name || !data.customerDetails?.mobile || !data.customerDetails?.address) {
      throw new BadRequestException('Complete customer details (name, mobile, address) are required');
    }

    // 1. Pre-validate all items and calculate snapshots
    const orderItems: any[] = [];
    let subtotal = 0;
    let totalDiscount = 0;

    for (const reqItem of data.items) {
      const product = await this.productModel.findById(reqItem.productId).exec();
      if (!product || !product.isPublished) {
        throw new NotFoundException(`Product not found or currently unavailable`);
      }

      const variant = product.variants.find((v) => v.sku === reqItem.sku);
      if (!variant) {
        throw new NotFoundException(`Variant with SKU "${reqItem.sku}" not found for product "${product.name}"`);
      }

      const availableStock = (variant.stockQuantity || 0) - (variant.reservedQuantity || 0);
      if (availableStock < reqItem.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${product.name} (${variant.color || ''} ${variant.size || ''})". Available: ${availableStock}, Requested: ${reqItem.quantity}`,
        );
      }

      const unitPrice = variant.price > 0 ? variant.price : product.salePrice;
      const costPrice = variant.costPrice || 0;
      const discount = product.originalPrice > unitPrice ? product.originalPrice - unitPrice : 0;

      orderItems.push({
        productId: product._id as any,
        productName: product.name,
        productImage: product.images?.[0] || '',
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

    // 2. Generate Unique Order ID (AVE-YYYYMMDD-XXXXX)
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderId = `AVE-${todayStr}-${randomSuffix}`;

    // 3. Atomically Reserve Inventory (Increments reservedQuantity, leaves stockQuantity intact)
    for (const item of orderItems) {
      await this.inventoryService.reserveStock(
        item.productId.toString(),
        item.sku,
        item.quantity,
        orderId,
      );
    }

    // 4. Delivery charge based on district
    const isDhaka = data.customerDetails.district?.toLowerCase().includes('dhaka');
    const deliveryCharge = data.deliveryCharge !== undefined ? data.deliveryCharge : (isDhaka ? 70 : 130);
    const totalAmount = subtotal + deliveryCharge;

    // 5. Create / Update Customer profile
    let customer = await this.customerModel.findOne({ mobile: data.customerDetails.mobile }).exec();
    if (!customer) {
      customer = await this.customerModel.create({
        name: data.customerDetails.name,
        mobile: data.customerDetails.mobile,
        addresses: [
          {
            district: data.customerDetails.district || 'Dhaka',
            area: '',
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

    // 6. Create Order document
    const paymentMethod = data.paymentMethod || 'COD';
    const orderDoc: any = {
      orderId,
      customerId: customer._id as any,
      customerDetails: {
        name: data.customerDetails.name,
        mobile: data.customerDetails.mobile,
        address: data.customerDetails.address,
        district: data.customerDetails.district || 'Dhaka',
      },
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod,
      items: orderItems,
      subtotal,
      discount: totalDiscount,
      deliveryCharge,
      totalAmount,
      notes: data.notes || '',
    };

    const order = await this.orderModel.create(orderDoc);

    // 7. Create Payment Record
    await this.paymentModel.create({
      orderId: (order as any)._id,
      transactionId: `TXN-${orderId}`,
      method: paymentMethod,
      provider: paymentMethod === 'COD' ? 'CashOnDelivery' : paymentMethod,
      amount: totalAmount,
      status: 'PENDING',
    });

    return order;
  }

  // Secure Order Tracking: REQUIRES BOTH Order ID AND Mobile Number to match!
  async trackOrder(orderId: string, mobile: string) {
    if (!orderId?.trim() || !mobile?.trim()) {
      throw new BadRequestException('Both Order ID and Mobile Number are required for order tracking verification.');
    }

    const cleanOrderId = orderId.trim();
    const cleanMobile = mobile.trim().replace(/[\s-]/g, '');

    const order = await this.orderModel.findOne({ orderId: cleanOrderId }).exec();

    if (!order) {
      throw new NotFoundException(`No order found matching Reference ID "${cleanOrderId}".`);
    }

    // Verify phone number match
    const orderPhone = order.customerDetails?.mobile?.replace(/[\s-]/g, '');
    if (orderPhone !== cleanMobile && !orderPhone?.endsWith(cleanMobile) && !cleanMobile.endsWith(orderPhone || '')) {
      throw new UnauthorizedException('The mobile number provided does not match the recipient on this order.');
    }

    return order;
  }

  async getAdminOrders(query: { status?: string; search?: string; limit?: number }) {
    const filter: any = {};
    if (query.status && query.status !== 'ALL') {
      filter.status = query.status;
    }
    if (query.search) {
      filter.$or = [
        { orderId: { $regex: query.search, $options: 'i' } },
        { 'customerDetails.name': { $regex: query.search, $options: 'i' } },
        { 'customerDetails.mobile': { $regex: query.search, $options: 'i' } },
      ];
    }

    const limit = Math.max(1, Math.min(200, Number(query.limit) || 100));
    return this.orderModel.find(filter).sort({ createdAt: -1 }).limit(limit).exec();
  }

  async getOrderById(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  // Update order status with clean fulfillment, cancellation, and return inventory handling
  async updateOrderStatus(id: string, newStatus: OrderStatus, paymentStatus?: PaymentStatus) {
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
    // Deducts physical stock and releases reserved stock. (No double deduction)
    if (newStatus === OrderStatus.DELIVERED && oldStatus !== OrderStatus.DELIVERED) {
      for (const item of order.items) {
        await this.inventoryService.fulfillStock(
          item.productId.toString(),
          item.sku,
          item.quantity,
          order.orderId,
        );
      }
      if (order.paymentMethod === 'COD') {
        order.paymentStatus = PaymentStatus.PAID;
      }
    }

    // 2. Transitioning to CANCELLED from an active unfulfilled order:
    // Releases reserved stock, making available stock ready for other patrons.
    else if (newStatus === OrderStatus.CANCELLED && oldStatus !== OrderStatus.CANCELLED && oldStatus !== OrderStatus.DELIVERED && oldStatus !== OrderStatus.RETURNED) {
      for (const item of order.items) {
        await this.inventoryService.releaseReservation(
          item.productId.toString(),
          item.sku,
          item.quantity,
          order.orderId,
        );
      }
    }

    // 3. Transitioning to RETURNED from DELIVERED:
    // Restores physical inventory on hand.
    else if (newStatus === OrderStatus.RETURNED && oldStatus === OrderStatus.DELIVERED) {
      for (const item of order.items) {
        await this.inventoryService.returnStock(
          item.productId.toString(),
          item.sku,
          item.quantity,
          order.orderId,
        );
      }
    }

    order.status = newStatus;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();
    return order;
  }
}
