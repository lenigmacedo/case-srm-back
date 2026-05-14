import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { IPricingStrategy } from './interfaces/pricing-strategy.interface';
import { DuplicataMercantilStrategy } from './strategies/duplicata-mercantil.strategy';
import { ChequePreDatadoStrategy } from './strategies/cheque-pre-datado.strategy';

@Injectable()
export class PricingFactory {
  private readonly strategies = new Map<string, IPricingStrategy>([
    ['DUPLICATA_MERCANTIL', new DuplicataMercantilStrategy()],
    ['CHEQUE_PRE_DATADO', new ChequePreDatadoStrategy()],
  ]);

  getStrategy(receivableTypeCode: string): IPricingStrategy {
    const strategy = this.strategies.get(receivableTypeCode);
    if (!strategy) {
      throw new UnprocessableEntityException(
        `No pricing strategy found for receivable type: ${receivableTypeCode}`,
      );
    }
    return strategy;
  }
}
