import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { UploadModule } from './modules/upload/upload.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CustomersModule } from './modules/customers/customers.module';
import { FinanceModule } from './modules/finance/finance.module';
import { SeedModule } from './modules/seed/seed.module';

import { User, UserSchema } from './schemas/user.schema';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { Category, CategorySchema } from './schemas/category.schema';
import { Product, ProductSchema } from './schemas/product.schema';
import { Order, OrderSchema } from './schemas/order.schema';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { AuditLog, AuditLogSchema } from './schemas/audit-log.schema';
import { InventoryTransaction, InventoryTransactionSchema } from './schemas/inventory-transaction.schema';
import { Expense, ExpenseSchema } from './schemas/expense.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI') || 'mongodb://127.0.0.1:27017/avelora_dev',
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: InventoryTransaction.name, schema: InventoryTransactionSchema },
      { name: Expense.name, schema: ExpenseSchema },
    ]),
    UsersModule,
    AuthModule,
    UploadModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    InventoryModule,
    CustomersModule,
    FinanceModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
