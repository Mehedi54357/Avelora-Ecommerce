import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsService } from './settings.service';
import { DataManagementService } from './data-management.service';
import { SettingsController } from './settings.controller';
import { Settings, SettingsSchema } from '../../schemas/settings.schema';
import { DeliveryZone, DeliveryZoneSchema } from '../../schemas/delivery-zone.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { Order, OrderSchema } from '../../schemas/order.schema';
import { InventoryTransaction, InventoryTransactionSchema } from '../../schemas/inventory-transaction.schema';
import { Payment, PaymentSchema } from '../../schemas/payment.schema';
import { ReturnRequest, ReturnRequestSchema } from '../../schemas/return-request.schema';
import { AuthModule } from '../auth/auth.module';
import { InventoryModule } from '../inventory/inventory.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Settings.name, schema: SettingsSchema },
      { name: DeliveryZone.name, schema: DeliveryZoneSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
      { name: InventoryTransaction.name, schema: InventoryTransactionSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: ReturnRequest.name, schema: ReturnRequestSchema },
    ]),
    AuthModule,
    InventoryModule,
    AuditLogModule,
  ],
  providers: [SettingsService, DataManagementService],
  controllers: [SettingsController],
  exports: [SettingsService, DataManagementService],
})
export class SettingsModule {}
