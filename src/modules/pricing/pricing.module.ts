import { Module } from '@nestjs/common';
import { PricingFactory } from './pricing.factory';

@Module({
  providers: [PricingFactory],
  exports: [PricingFactory],
})
export class PricingModule {}
