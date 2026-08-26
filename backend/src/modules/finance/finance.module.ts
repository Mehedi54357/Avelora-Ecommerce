import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { Expense, ExpenseSchema } from '../../schemas/expense.schema';
import { Order, OrderSchema } from '../../schemas/order.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { Supplier, SupplierSchema } from '../../schemas/supplier.schema';
import { PurchaseOrder, PurchaseOrderSchema } from '../../schemas/purchase.schema';
import { CapitalTransaction, CapitalTransactionSchema } from '../../schemas/capital.schema';
import { CourierSettlement, CourierSettlementSchema } from '../../schemas/courier-settlement.schema';
import { Payment, PaymentSchema } from '../../schemas/payment.schema';
import { ReturnRequest, ReturnRequestSchema } from '../../schemas/return-request.schema';
import { AuthModule } from '../auth/auth.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Expense.name, schema: ExpenseSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Supplier.name, schema: SupplierSchema },
      { name: PurchaseOrder.name, schema: PurchaseOrderSchema },
      { name: CapitalTransaction.name, schema: CapitalTransactionSchema },
      { name: CourierSettlement.name, schema: CourierSettlementSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: ReturnRequest.name, schema: ReturnRequestSchema },
    ]),
    AuthModule,
    AuditLogModule,
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
