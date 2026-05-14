import { Injectable } from '@nestjs/common';
import { ReceivableType } from '../receivable-type/entities/receivable-type.entity';
import { IPricingStrategy } from './interfaces/pricing-strategy.interface';
import { SpreadPricingStrategy } from './strategies/spread-pricing.strategy';

@Injectable()
export class PricingFactory {
  getStrategy(receivableType: ReceivableType): IPricingStrategy {
    return new SpreadPricingStrategy(receivableType.spread_monthly);
  }
}
