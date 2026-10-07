import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CapitalService } from './capital.service';
import { CapitalController } from './capital.controller';
import { CapitalTransaction, CapitalTransactionSchema } from '../../schemas/capital.schema';
import { ProductInvestment, ProductInvestmentSchema } from '../../schemas/product-investment.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { InventoryTransaction, InventoryTransactionSchema } from '../../schemas/inventory-transaction.schema';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CapitalTransaction.name, schema: CapitalTransactionSchema },
      { name: ProductInvestment.name, schema: ProductInvestmentSchema },
      { name: Product.name, schema: ProductSchema },
      { name: InventoryTransaction.name, schema: InventoryTransactionSchema },
    ]),
    AuditLogModule,
  ],
  controllers: [CapitalController],
  providers: [CapitalService],
  exports: [CapitalService],
})
export class CapitalModule {}

