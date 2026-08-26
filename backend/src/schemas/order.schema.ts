import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  PACKED = 'PACKED',
  COURIER_BOOKED = 'COURIER_BOOKED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURN_REQUESTED = 'RETURN_REQUESTED',
  RETURNED = 'RETURNED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PENDING = 'PENDING',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum CourierSettlementStatus {
  NOT_APPLICABLE = 'NOT_APPLICABLE',
  AWAITING_SETTLEMENT = 'AWAITING_SETTLEMENT',
  PARTIALLY_SETTLED = 'PARTIALLY_SETTLED',
  SETTLED = 'SETTLED',
  DISPUTED = 'DISPUTED',
}

export enum FulfillmentStatus {
  UNFULFILLED = 'UNFULFILLED',
  PROCESSING = 'PROCESSING',
  PACKED = 'PACKED',
  COURIER_BOOKED = 'COURIER_BOOKED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
}

@Schema()
export class OrderItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  productId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: false, default: '' })
  productImage: string;

  @Prop({ required: true })
  sku: string;

  @Prop({ required: false, default: '' })
  variant: string;

  @Prop({ required: false, default: '' })
  color: string;

  @Prop({ required: false, default: '' })
  size: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, default: 0 })
  unitPrice: number; // Selling price snapshot at time of order

  @Prop({ required: true, default: 0 })
  costPrice: number; // Cost of goods snapshot at time of order

  @Prop({ required: false, default: 0 })
  discount: number; // Discount per unit snapshot
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema()
export class CustomerDetailsSnapshot {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  mobile: string;

  @Prop({ required: false, default: '' })
  altMobile?: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: false, default: 'Dhaka' })
  division?: string;

  @Prop({ required: true, default: 'Dhaka' })
  district: string;

  @Prop({ required: false, default: '' })
  upazila?: string;

  @Prop({ required: false, default: '' })
  union?: string;
}

export const CustomerDetailsSnapshotSchema = SchemaFactory.createForClass(CustomerDetailsSnapshot);

@Schema()
export class OrderTimelineEntry {
  @Prop({ required: true })
  status: string;

  @Prop({ required: true, default: Date.now })
  at: Date;

  @Prop({ required: false, default: 'SYSTEM' })
  actor?: string;

  @Prop({ required: false, default: '' })
  note?: string;
}

export const OrderTimelineEntrySchema = SchemaFactory.createForClass(OrderTimelineEntry);

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true, index: true })
  orderId: string; // e.g. AVE-20260824-00125

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer', required: false, index: true })
  customerId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: CustomerDetailsSnapshotSchema, required: true })
  customerDetails: CustomerDetailsSnapshot;

  @Prop({ required: true, enum: OrderStatus, default: OrderStatus.PENDING, index: true })
  status: OrderStatus;

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING, index: true })
  paymentStatus: PaymentStatus;

  @Prop({ required: false, enum: FulfillmentStatus, default: FulfillmentStatus.UNFULFILLED })
  fulfillmentStatus?: FulfillmentStatus;

  @Prop({ required: true, default: 'COD' })
  paymentMethod: string; // 'COD' | 'bKash' | 'Nagad' | 'CARD'

  @Prop({ required: false, default: 'bKash' })
  paymentProvider?: string; // 'bKash' | 'Nagad' | 'SSLCOMMERZ' | 'CashOnDelivery'

  @Prop({ required: true, default: 0 })
  paidAmount: number; // Advance delivery charge (৳70/৳130) or full amount

  @Prop({ required: true, default: 0 })
  dueAmount: number; // Remaining amount to collect on delivery

  @Prop({ required: false, default: '' })
  senderMobile?: string; // bKash/Nagad number used to pay

  @Prop({ required: false, default: '' })
  transactionId?: string; // TrxID from bKash/Nagad

  @Prop({ required: false, default: false })
  isAdvancePaid: boolean;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ required: true, default: 0 })
  subtotal: number;

  @Prop({ required: true, default: 0 })
  discount: number;

  @Prop({ required: false, default: '' })
  couponCode?: string;

  @Prop({ required: false, default: 0 })
  couponDiscount?: number;

  @Prop({ required: true, default: 0 })
  deliveryCharge: number;

  @Prop({ required: true, default: 0 })
  totalAmount: number;

  @Prop({ required: false, default: '' })
  notes?: string;

  @Prop({ type: [OrderTimelineEntrySchema], default: [] })
  timeline: OrderTimelineEntry[];

  @Prop({
    type: {
      provider: { type: String, default: '' },
      consignmentId: { type: String, default: '' },
      trackingUrl: { type: String, default: '' },
      charge: { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 0 },
      returnFee: { type: Number, default: 0 },
      amountToCollect: { type: Number, default: 0 },
      storeId: { type: Number },
      pathaoStatus: { type: String, default: '' },
      bookedAt: { type: Date },
      pickedUpAt: { type: Date },
      deliveredAt: { type: Date },
      // Courier COD Settlement State Machine
      settlementStatus: {
        type: String,
        enum: Object.values(CourierSettlementStatus),
        default: CourierSettlementStatus.NOT_APPLICABLE,
      },
      expectedSettlement: { type: Number, default: 0 },
      actualSettlement: { type: Number, default: 0 },
      settledAt: { type: Date },
      settlementAccount: { type: String, default: '' },
      transactionRef: { type: String, default: '' },
      variance: { type: Number, default: 0 },
      settlementNotes: { type: String, default: '' },
    },
    required: false,
    _id: false,
  })
  courier?: {
    provider: string;
    consignmentId: string;
    trackingUrl: string;
    charge: number;
    deliveryFee?: number;
    returnFee?: number;
    amountToCollect?: number;
    storeId?: number;
    pathaoStatus?: string;
    bookedAt?: Date;
    pickedUpAt?: Date;
    deliveredAt?: Date;
    settlementStatus?: CourierSettlementStatus;
    expectedSettlement?: number;
    actualSettlement?: number;
    settledAt?: Date;
    settlementAccount?: string;
    transactionRef?: string;
    variance?: number;
    settlementNotes?: string;
  };

  @Prop({
    type: {
      labelVersion: { type: Number, default: 1 },
      lastIssuedAt: { type: Date },
    },
    required: false,
    _id: false,
  })
  qr?: {
    labelVersion: number;
    lastIssuedAt?: Date;
  };

  @Prop({ required: false, default: '' })
  cancellationReason?: string;

  @Prop({
    type: {
      reason: { type: String, default: '' },
      returnedAt: { type: Date },
      refundAmount: { type: Number, default: 0 },
      restocked: { type: Boolean, default: false },
      refundMethod: { type: String, default: 'bKash' },
    },
    required: false,
    _id: false,
  })
  returnDetails?: {
    reason: string;
    returnedAt?: Date;
    refundAmount?: number;
    restocked?: boolean;
    refundMethod?: string;
  };
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'customerDetails.mobile': 1 });
OrderSchema.index({ status: 1, paymentStatus: 1 });
