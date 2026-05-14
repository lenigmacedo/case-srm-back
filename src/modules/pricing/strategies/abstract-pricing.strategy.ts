import Decimal from 'decimal.js';
import {
  IPricingStrategy,
  PricingParams,
  PricingResult,
} from '../interfaces/pricing-strategy.interface';

export abstract class AbstractPricingStrategy implements IPricingStrategy {
  abstract readonly spreadMonthly: Decimal;

  calculate(params: PricingParams): PricingResult {
    const faceValue = new Decimal(params.faceValue);
    const termMonths = new Decimal(params.termDays).div(30);
    const baseRate = new Decimal(params.baseRateMonthly);
    const totalRate = baseRate.plus(this.spreadMonthly);

    // PV = FV / (1 + rate)^term
    const presentValue = faceValue.div(
      Decimal.pow(new Decimal(1).plus(totalRate), termMonths),
    );

    const discountAmount = faceValue.minus(presentValue);
    const discountRate = discountAmount.div(faceValue);

    return {
      presentValue: presentValue.toDecimalPlaces(6).toString(),
      discountAmount: discountAmount.toDecimalPlaces(6).toString(),
      discountRate: discountRate.toDecimalPlaces(6).toString(),
      spreadMonthly: this.spreadMonthly.toString(),
    };
  }
}
