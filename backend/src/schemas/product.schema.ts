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
  size: string;

  @Prop({ required: true, default: 0 })
  price: number; // Selling price in BDT

  @Prop({ required: true, default: 0 })
  costPrice: number; // Cost of goods (COGS)

  @Prop({ required: true, default: 0 })
  stockQuantity: number; // Total physical inventory on hand

  @Prop({ required: false, default: 0 })
  reservedQuantity: number; // Currently reserved by active orders
}

export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', required: false, index: true })
  categoryId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: false, default: '' })
  description: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ required: true, default: 0 })
  originalPrice: number;

  @Prop({ required: false, default: 0 })
  discountPercentage: number;

  @Prop({ required: true, default: 0 })
  salePrice: number;

  @Prop({ default: true })
  isPublished: boolean;

  @Prop({ type: [ProductVariantSchema], default: [] })
  variants: ProductVariant[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ name: 'text', description: 'text' });
