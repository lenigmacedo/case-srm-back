import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceivableType } from '../receivable-type/entities/receivable-type.entity';
import { TransactionRepository } from './transaction.repository';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { PricingModule } from '../pricing/pricing.module';
import { CurrencyModule } from '../currency/currency.module';
import { Transaction } from './entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReceivableType, Transaction]),
    PricingModule,
    CurrencyModule,
  ],
  providers: [TransactionRepository, TransactionService],
  controllers: [TransactionController],
})
export class TransactionModule {}
