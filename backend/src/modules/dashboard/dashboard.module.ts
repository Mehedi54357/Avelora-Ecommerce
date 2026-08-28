import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Order, OrderSchema } from '../../schemas/order.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { Expense, ExpenseSchema } from '../../schemas/expense.schema';
import { ReturnRequest, ReturnRequestSchema } from '../../schemas/return-request.schema';
import { AuthModule } from '../auth/auth.module';
import { FinanceModule } from '../finance/finance.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Expense.name, schema: ExpenseSchema },
      { name: ReturnRequest.name, schema: ReturnRequestSchema },
    ]),
    AuthModule,
    FinanceModule,
    AuditLogModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
