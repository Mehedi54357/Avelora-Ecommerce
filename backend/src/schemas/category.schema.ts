import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true, enum: ['women', 'men', 'kids'], default: 'women', index: true })
  department: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: false })
  image?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', required: false })
  parentCategory?: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ department: 1, sortOrder: 1 });
