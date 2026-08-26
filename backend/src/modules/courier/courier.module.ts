import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PathaoService } from './pathao.service';
import { CourierController } from './courier.controller';
import { PathaoToken, PathaoTokenSchema } from '../../schemas/pathao-token.schema';
import { Order, OrderSchema } from '../../schemas/order.schema';
import { Settings, SettingsSchema } from '../../schemas/settings.schema';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PathaoToken.name, schema: PathaoTokenSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Settings.name, schema: SettingsSchema },
    ]),
    AuditLogModule,
  ],
  controllers: [CourierController],
  providers: [PathaoService],
  exports: [PathaoService],
})
export class CourierModule {}
