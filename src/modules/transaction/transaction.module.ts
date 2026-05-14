import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { ReceivableType } from '../receivable-type/entities/receivable-type.entity';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { PricingModule } from '../pricing/pricing.module';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, ReceivableType]),
    PricingModule,
    CurrencyModule,
  ],
  providers: [TransactionService],
  controllers: [TransactionController],
})
export class TransactionModule {}
