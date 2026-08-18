import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURN_REQUESTED = 'RETURN_REQUESTED',
  RETURNED = 'RETURNED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
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

  @Prop({ required: true })
  address: string;

  @Prop({ required: true, default: 'Dhaka' })
  district: string;
}

export const CustomerDetailsSnapshotSchema = SchemaFactory.createForClass(CustomerDetailsSnapshot);

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true, index: true })
  orderId: string; // e.g. AVE-20260817-00125

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer', required: false, index: true })
  customerId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: CustomerDetailsSnapshotSchema, required: true })
  customerDetails: CustomerDetailsSnapshot;

  @Prop({ required: true, enum: OrderStatus, default: OrderStatus.PENDING, index: true })
  status: OrderStatus;

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Prop({ required: true, default: 'COD' })
  paymentMethod: string; // 'COD' | 'bKash' | 'Nagad'

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ required: true, default: 0 })
  subtotal: number;

  @Prop({ required: true, default: 0 })
  discount: number;

  @Prop({ required: true, default: 0 })
  deliveryCharge: number;

  @Prop({ required: true, default: 0 })
  totalAmount: number;

  @Prop({ required: false, default: '' })
  notes?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'customerDetails.mobile': 1 });
