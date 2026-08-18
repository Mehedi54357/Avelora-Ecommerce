import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { Category, CategorySchema } from '../../schemas/category.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { Expense, ExpenseSchema } from '../../schemas/expense.schema';
import { Order, OrderSchema } from '../../schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema },
      { name: Expense.name, schema: ExpenseSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
