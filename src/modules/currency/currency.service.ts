import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Decimal from 'decimal.js';
import { Currency } from './entities/currency.entity';

@Injectable()
export class CurrencyService implements OnModuleInit {
  private readonly rateCache = new Map<string, Decimal>();

  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
  ) {}

  async onModuleInit() {
    await this.refreshCache();
  }

  private async refreshCache(): Promise<void> {
    const currencies = await this.currencyRepository.find();
    for (const c of currencies) {
      this.rateCache.set(c.code, new Decimal(c.rate_to_brl));
    }
  }

  async getRateToBrl(code: string): Promise<Decimal> {
    if (this.rateCache.has(code)) {
      return this.rateCache.get(code)!;
    }
    const currency = await this.currencyRepository.findOne({ where: { code } });
    if (!currency) throw new NotFoundException(`Currency ${code} not found`);
    const rate = new Decimal(currency.rate_to_brl);
    this.rateCache.set(code, rate);
    return rate;
  }

  async updateRate(code: string, newRate: string): Promise<Currency> {
    const currency = await this.currencyRepository.findOne({ where: { code } });
    if (!currency) throw new NotFoundException(`Currency ${code} not found`);
    currency.rate_to_brl = newRate;
    const saved = await this.currencyRepository.save(currency);
    this.rateCache.set(code, new Decimal(newRate));
    return saved;
  }

  async convert(
    amount: Decimal,
    fromCurrency: string,
    toCurrency: string,
  ): Promise<{ result: Decimal; fxRate: Decimal }> {
    if (fromCurrency === toCurrency) {
      return { result: amount, fxRate: new Decimal(1) };
    }
    const fromRate = await this.getRateToBrl(fromCurrency);
    const toRate = await this.getRateToBrl(toCurrency);
    const amountInBrl = amount.mul(fromRate);
    const result = amountInBrl.div(toRate);
    const fxRate = fromRate.div(toRate);
    return { result, fxRate };
  }

  findAll(): Promise<Currency[]> {
    return this.currencyRepository.find();
  }
}
