import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QrTokenService } from './qr-token.service';
import { QrService } from './qr.service';
import { QrController } from './qr.controller';
import { QrAdminController } from './qr-admin.controller';
import { QrToken, QrTokenSchema } from '../../schemas/qr-token.schema';
import { QrScanEvent, QrScanEventSchema } from '../../schemas/qr-scan-event.schema';
import { IdempotencyKey, IdempotencyKeySchema } from '../../schemas/idempotency-key.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { Order, OrderSchema } from '../../schemas/order.schema';
import { OrdersModule } from '../orders/orders.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QrToken.name, schema: QrTokenSchema },
      { name: QrScanEvent.name, schema: QrScanEventSchema },
      { name: IdempotencyKey.name, schema: IdempotencyKeySchema },
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    forwardRef(() => OrdersModule),
    AuthModule,
  ],
  providers: [QrTokenService, QrService],
  controllers: [QrController, QrAdminController],
  exports: [QrTokenService, QrService],
})
export class QrModule {}
