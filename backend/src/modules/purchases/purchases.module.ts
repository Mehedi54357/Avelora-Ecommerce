import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { Supplier, SupplierSchema } from '../../schemas/supplier.schema';
import { PurchaseOrder, PurchaseOrderSchema } from '../../schemas/purchase.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { InventoryTransaction, InventoryTransactionSchema } from '../../schemas/inventory-transaction.schema';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Supplier.name, schema: SupplierSchema },
      { name: PurchaseOrder.name, schema: PurchaseOrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: InventoryTransaction.name, schema: InventoryTransactionSchema },
    ]),
    AuditLogModule,
  ],
  controllers: [PurchasesController],
  providers: [PurchasesService],
  exports: [PurchasesService],
})
export class PurchasesModule {}
