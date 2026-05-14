import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Decimal from 'decimal.js';
import { Transaction, TransactionStatus } from './entities/transaction.entity';
import { Cedente } from '../cedente/entities/cedente.entity';
import { ReceivableType } from '../receivable-type/entities/receivable-type.entity';
import { PricingFactory } from '../pricing/pricing.factory';
import { CurrencyService } from '../currency/currency.service';
import { SimulateTransactionDto } from './dto/simulate-transaction.dto';
import { LiquidateTransactionDto } from './dto/liquidate-transaction.dto';
import { StatementFilterDto } from './dto/statement-filter.dto';
import { TransactionRepository } from './transaction.repository';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(ReceivableType)
    private readonly receivableTypeRepository: Repository<ReceivableType>,
    private readonly transactionRepository: TransactionRepository,
    private readonly pricingFactory: PricingFactory,
    private readonly currencyService: CurrencyService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  private getBaseRate(): string {
    return this.configService.get<string>('BASE_RATE_MONTHLY', '0.01');
  }

  async simulate(dto: SimulateTransactionDto) {
    const receivableType = await this.receivableTypeRepository.findOne({
      where: { id: dto.receivable_type_id },
    });
    if (!receivableType)
      throw new NotFoundException(
        `ReceivableType ${dto.receivable_type_id} not found`,
      );

    const strategy = this.pricingFactory.getStrategy(receivableType);
    const baseRate = this.getBaseRate();
    const pricing = strategy.calculate({
      faceValue: dto.face_value,
      termDays: dto.term_days,
      baseRateMonthly: baseRate,
    });

    const originCurrency = dto.origin_currency?.toUpperCase() ?? 'BRL';
    const paymentCurrency = dto.payment_currency?.toUpperCase() ?? 'BRL';

    let presentValueConverted = pricing.presentValue;
    let fxRate: string | null = null;

    if (originCurrency !== paymentCurrency) {
      const { result, fxRate: rate } = await this.currencyService.convert(
        new Decimal(pricing.presentValue),
        originCurrency,
        paymentCurrency,
      );
      presentValueConverted = result.toDecimalPlaces(6).toString();
      fxRate = rate.toDecimalPlaces(6).toString();
    }

    return {
      face_value: dto.face_value,
      present_value_brl: pricing.presentValue,
      present_value: presentValueConverted,
      discount_amount: pricing.discountAmount,
      discount_rate: pricing.discountRate,
      spread_monthly: pricing.spreadMonthly,
      base_rate_monthly: baseRate,
      origin_currency: originCurrency,
      payment_currency: paymentCurrency,
      fx_rate: fxRate,
      term_days: dto.term_days,
      due_date: dto.due_date,
    };
  }

  async liquidate(dto: LiquidateTransactionDto): Promise<Transaction> {
    return this.dataSource.transaction(async (manager) => {
      const cedente = await manager.findOne(Cedente, {
        where: { id: dto.cedente_id },
      });
      if (!cedente)
        throw new NotFoundException(`Cedente ${dto.cedente_id} not found`);

      const receivableType = await manager.findOne(ReceivableType, {
        where: { id: dto.receivable_type_id },
      });
      if (!receivableType)
        throw new NotFoundException(
          `ReceivableType ${dto.receivable_type_id} not found`,
        );

      const strategy = this.pricingFactory.getStrategy(receivableType);
      const baseRate = this.getBaseRate();
      const pricing = strategy.calculate({
        faceValue: dto.face_value,
        termDays: dto.term_days,
        baseRateMonthly: baseRate,
      });

      const originCurrency = dto.origin_currency?.toUpperCase() ?? 'BRL';
      const paymentCurrency = dto.payment_currency?.toUpperCase() ?? 'BRL';

      let presentValueFinal = pricing.presentValue;
      let fxRate: string | null = null;

      if (originCurrency !== paymentCurrency) {
        const { result, fxRate: rate } = await this.currencyService.convert(
          new Decimal(pricing.presentValue),
          originCurrency,
          paymentCurrency,
        );
        presentValueFinal = result.toDecimalPlaces(6).toString();
        fxRate = rate.toDecimalPlaces(6).toString();
      }

      const transaction = manager.create(Transaction, {
        face_value: dto.face_value,
        present_value: presentValueFinal,
        discount_amount: pricing.discountAmount,
        discount_rate: pricing.discountRate,
        term_days: dto.term_days,
        due_date: dto.due_date,
        base_rate_monthly: baseRate,
        payment_currency: paymentCurrency,
        origin_currency: originCurrency,
        fx_rate: fxRate,
        status: TransactionStatus.LIQUIDATED,
        cedente_id: cedente.id,
        receivable_type_id: receivableType.id,
      });

      return manager.save(Transaction, transaction);
    });
  }

  async getStatement(filter: StatementFilterDto) {
    return this.transactionRepository.getStatement(filter);
  }
}
