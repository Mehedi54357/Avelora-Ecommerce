import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PurchaseOrderDocument = PurchaseOrder & Document;

export enum PurchaseStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  PARTIAL = 'PARTIAL',
  CANCELLED = 'CANCELLED',
}

export enum PurchasePaymentStatus {
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
}

@Schema({ _id: false })
export class PurchaseItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  sku: string;

  @Prop({ required: false, default: '' })
  variantName: string;

  @Prop({ required: false, default: '' })
  color: string;

  @Prop({ required: false, default: '' })
  size: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  unitCost: number;

  @Prop({ required: true, min: 0 })
  totalCost: number;
}

export const PurchaseItemSchema = SchemaFactory.createForClass(PurchaseItem);

@Schema({ timestamps: true })
export class PurchaseOrder {
  @Prop({ required: true, unique: true, index: true })
  purchaseId: string;

  @Prop({ type: Types.ObjectId, ref: 'Supplier', required: true, index: true })
  supplierId: Types.ObjectId;

  @Prop({ required: true })
  supplierName: string;

  @Prop({ required: false, default: '' })
  invoiceNumber: string;

  @Prop({ type: [PurchaseItemSchema], required: true, default: [] })
  items: PurchaseItem[];

  @Prop({ required: true, default: 0 })
  subtotalCost: number;

  @Prop({ required: false, default: 0 })
  additionalCost: number;

  @Prop({ required: true, default: 0 })
  totalCost: number;

  @Prop({ required: false, default: 0 })
  paidAmount: number;

  @Prop({ required: false, default: 0 })
  dueAmount: number;

  @Prop({
    required: true,
    enum: Object.values(PurchaseStatus),
    default: PurchaseStatus.PENDING,
  })
  status: PurchaseStatus;

  @Prop({
    required: true,
    enum: Object.values(PurchasePaymentStatus),
    default: PurchasePaymentStatus.UNPAID,
  })
  paymentStatus: PurchasePaymentStatus;

  @Prop({ required: false })
  receivedAt?: Date;

  @Prop({ required: false, default: '' })
  receivedBy?: string;

  @Prop({ required: false, default: '' })
  notes?: string;
}

export const PurchaseOrderSchema = SchemaFactory.createForClass(PurchaseOrder);
PurchaseOrderSchema.index({ status: 1, createdAt: -1 });
PurchaseOrderSchema.index({ supplierId: 1, createdAt: -1 });
