import Decimal from 'decimal.js';
import { AbstractPricingStrategy } from './abstract-pricing.strategy';

export class DuplicataMercantilStrategy extends AbstractPricingStrategy {
  readonly spreadMonthly = new Decimal('0.015');
}
