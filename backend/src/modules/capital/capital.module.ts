import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CapitalService } from './capital.service';
import { CapitalController } from './capital.controller';
import { CapitalTransaction, CapitalTransactionSchema } from '../../schemas/capital.schema';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CapitalTransaction.name, schema: CapitalTransactionSchema },
    ]),
    AuditLogModule,
  ],
  controllers: [CapitalController],
  providers: [CapitalService],
  exports: [CapitalService],
})
export class CapitalModule {}
