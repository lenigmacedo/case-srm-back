import Decimal from 'decimal.js';
import { SpreadPricingStrategy } from 'src/modules/pricing/strategies/spread-pricing.strategy';

describe('SpreadPricingStrategy', () => {
  describe('Duplicata Mercantil (spread 1.5% a.m.)', () => {
    const strategy = new SpreadPricingStrategy('0.015');

    it('deve calcular VP corretamente para 30 dias', () => {
      const result = strategy.calculate({
        faceValue: '100000',
        termDays: 30,
        baseRateMonthly: '0.01',
      });

      // PV = 100000 / (1 + 0.01 + 0.015)^1 = 100000 / 1.025
      const expected = new Decimal('100000').div(new Decimal('1.025'));
      expect(new Decimal(result.presentValue).toFixed(2)).toBe(
        expected.toFixed(2),
      );
    });

    it('deve calcular VP corretamente para 60 dias (2 meses)', () => {
      const result = strategy.calculate({
        faceValue: '100000',
        termDays: 60,
        baseRateMonthly: '0.01',
      });

      // PV = 100000 / (1.025)^2
      const expected = new Decimal('100000').div(Decimal.pow('1.025', 2));
      expect(new Decimal(result.presentValue).toFixed(2)).toBe(
        expected.toFixed(2),
      );
    });

    it('deve retornar spread correto', () => {
      const result = strategy.calculate({
        faceValue: '50000',
        termDays: 30,
        baseRateMonthly: '0',
      });
      expect(result.spreadMonthly).toBe('0.015');
    });

    it('deve calcular desconto positivo (face > VP)', () => {
      const result = strategy.calculate({
        faceValue: '100000',
        termDays: 30,
        baseRateMonthly: '0.01',
      });
      expect(new Decimal(result.discountAmount).greaterThan(0)).toBe(true);
      expect(new Decimal(result.presentValue).lessThan('100000')).toBe(true);
    });
  });

  describe('Cheque Pré-datado (spread 2.5% a.m.)', () => {
    const strategy = new SpreadPricingStrategy('0.025');

    it('deve calcular VP com spread de 2.5% a.m. para 30 dias', () => {
      const result = strategy.calculate({
        faceValue: '100000',
        termDays: 30,
        baseRateMonthly: '0.01',
      });

      // PV = 100000 / (1 + 0.01 + 0.025)^1 = 100000 / 1.035
      const expected = new Decimal('100000').div(new Decimal('1.035'));
      expect(new Decimal(result.presentValue).toFixed(2)).toBe(
        expected.toFixed(2),
      );
    });

    it('deve ter deságio maior que spread menor para mesmo prazo', () => {
      const params = {
        faceValue: '100000',
        termDays: 30,
        baseRateMonthly: '0.01',
      };
      const highSpread = new SpreadPricingStrategy('0.025').calculate(params);
      const lowSpread = new SpreadPricingStrategy('0.015').calculate(params);
      expect(
        new Decimal(highSpread.discountAmount).greaterThan(
          lowSpread.discountAmount,
        ),
      ).toBe(true);
    });

    it('deve calcular discount_rate como proporção do face_value', () => {
      const result = strategy.calculate({
        faceValue: '100000',
        termDays: 30,
        baseRateMonthly: '0',
      });
      const expectedRate = new Decimal(result.discountAmount).div('100000');
      expect(new Decimal(result.discountRate).toFixed(6)).toBe(
        expectedRate.toFixed(6),
      );
    });

    it('opera com face_value grande sem perda de precisão', () => {
      const result = strategy.calculate({
        faceValue: '999999999.999999',
        termDays: 30,
        baseRateMonthly: '0.01',
      });
      expect(new Decimal(result.presentValue).isFinite()).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('prazo zero resulta em VP igual ao face_value', () => {
      const result = new SpreadPricingStrategy('0.015').calculate({
        faceValue: '100000',
        termDays: 0,
        baseRateMonthly: '0.01',
      });
      expect(new Decimal(result.presentValue).toFixed(2)).toBe('100000.00');
    });

    it('aceita qualquer spread do banco sem alteração de código', () => {
      const customStrategy = new SpreadPricingStrategy('0.05');
      const result = customStrategy.calculate({
        faceValue: '100000',
        termDays: 30,
        baseRateMonthly: '0',
      });
      const expected = new Decimal('100000').div(new Decimal('1.05'));
      expect(new Decimal(result.presentValue).toFixed(2)).toBe(
        expected.toFixed(2),
      );
    });
  });
});
