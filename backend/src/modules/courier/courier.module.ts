import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PathaoService } from './pathao.service';
import { CourierController } from './courier.controller';
import { PathaoToken, PathaoTokenSchema } from '../../schemas/pathao-token.schema';
import { Order, OrderSchema } from '../../schemas/order.schema';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PathaoToken.name, schema: PathaoTokenSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    AuditLogModule,
  ],
  controllers: [CourierController],
  providers: [PathaoService],
  exports: [PathaoService],
})
export class CourierModule {}
