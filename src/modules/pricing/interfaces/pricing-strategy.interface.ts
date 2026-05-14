export interface PricingParams {
  faceValue: string;
  termDays: number;
  baseRateMonthly: string;
}

export interface PricingResult {
  presentValue: string;
  discountAmount: string;
  discountRate: string;
  spreadMonthly: string;
}

export interface IPricingStrategy {
  calculate(params: PricingParams): PricingResult;
}
