import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class ProductVariant {
  @Prop({ required: true })
  sku: string;

  @Prop({ required: false, default: '' })
  color: string;

  @Prop({ required: false, default: '' })
  colorHex?: string;

  @Prop({ required: false, default: '' })
  image?: string;

  @Prop({ required: false, default: '' })
  size: string;

  @Prop({ required: true, default: 0 })
  price: number; // Selling price in BDT

  @Prop({ required: true, default: 0 })
  costPrice: number; // Cost of goods (COGS)

  @Prop({ required: false, default: 0 })
  weightedAverageCost?: number; // Realized weighted-average unit acquisition cost

  @Prop({ required: true, default: 0 })
  stockQuantity: number; // Total physical inventory on hand

  @Prop({ required: false, default: 0 })
  reservedQuantity: number; // Currently reserved by active orders

  @Prop({ required: false, default: 2 })
  safetyStock?: number;
}

export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);

@Schema()
export class ProductFeature {
  @Prop({ required: true })
  title: string;

  @Prop({ required: false, default: '' })
  subtitle: string;

  @Prop({ required: false, default: 'sparkles' })
  icon: string;
}

export const ProductFeatureSchema = SchemaFactory.createForClass(ProductFeature);

@Schema({ _id: false })
export class ProductImageItem {
  @Prop({ required: true })
  url: string;

  @Prop({ required: false, default: '' })
  public_id?: string;

  @Prop({ required: false, default: 0 })
  sortOrder?: number;

  @Prop({ required: false, default: false })
  isPrimary?: boolean;

  @Prop({ required: false, default: '' })
  alt?: string;

  @Prop({ required: false, default: 0 })
  width?: number;

  @Prop({ required: false, default: 0 })
  height?: number;

  @Prop({ required: false, default: '' })
  variantColor?: string;
}

export const ProductImageItemSchema = SchemaFactory.createForClass(ProductImageItem);

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false, default: '' })
  subtitle?: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', required: false, index: true })
  categoryId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: false, default: '' })
  description: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [ProductImageItemSchema], default: [] })
  productImages?: ProductImageItem[];

  @Prop({ required: false, default: 'BEST SELLER' })
  badge?: string;

  @Prop({ required: false, default: '' })
  unitBadge?: string;

  @Prop({ required: false, default: 4.8 })
  rating?: number;

  @Prop({ required: false, default: 189 })
  reviewsCount?: number;

  @Prop({ type: [ProductFeatureSchema], default: [] })
  features?: ProductFeature[];

  @Prop({ required: true, default: 0 })
  originalPrice: number;

  @Prop({ required: false, default: 0 })
  discountPercentage: number;

  @Prop({ required: true, default: 0 })
  salePrice: number;

  @Prop({ required: false, default: true })
  isDiscountActive?: boolean;

  @Prop({ required: false })
  discountStartDate?: Date;

  @Prop({ required: false })
  discountEndDate?: Date;

  @Prop({ default: true, index: true })
  isPublished: boolean;

  @Prop({ required: false, default: 'ACTIVE', enum: ['ACTIVE', 'DRAFT', 'HIDDEN', 'ARCHIVED'], index: true })
  status: string;

  @Prop({ required: false, default: 'PRODUCTION', enum: ['PRODUCTION', 'TEST'], index: true })
  dataMode: string;

  @Prop({
    type: {
      enabled: { type: Boolean, default: true },
      publicCode: { type: String, sparse: true, index: true },
      generatedAt: { type: Date, default: Date.now },
    },
    required: false,
    _id: false,
  })
  qr?: {
    enabled: boolean;
    publicCode: string;
    generatedAt?: Date;
  };

  @Prop({ type: [ProductVariantSchema], default: [] })
  variants: ProductVariant[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ name: 'text', description: 'text' });
