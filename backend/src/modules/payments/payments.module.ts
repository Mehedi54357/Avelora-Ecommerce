import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment, PaymentSchema } from '../../schemas/payment.schema';
import { Order, OrderSchema } from '../../schemas/order.schema';
import { IdempotencyKey, IdempotencyKeySchema } from '../../schemas/idempotency-key.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Order.name, schema: OrderSchema },
      { name: IdempotencyKey.name, schema: IdempotencyKeySchema },
    ]),
    AuthModule,
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
