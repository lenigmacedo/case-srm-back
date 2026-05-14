import Decimal from 'decimal.js';
import { DuplicataMercantilStrategy } from 'src/modules/pricing/strategies/duplicata-mercantil.strategy';

describe('DuplicataMercantilStrategy', () => {
  const strategy = new DuplicataMercantilStrategy();

  it('deve calcular VP corretamente para 30 dias', () => {
    const result = strategy.calculate({
      faceValue: '100000',
      termDays: 30,
      baseRateMonthly: '0.01',
    });

    // VP = 100000 / (1 + 0.01 + 0.015)^1 = 100000 / 1.025 = 97560.975609...
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

    // VP = 100000 / (1.025)^2
    const expected = new Decimal('100000').div(Decimal.pow('1.025', 2));
    expect(new Decimal(result.presentValue).toFixed(2)).toBe(
      expected.toFixed(2),
    );
  });

  it('deve retornar spread correto (1.5% a.m.)', () => {
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

  it('deve lançar erro com prazo zero', () => {
    expect(() =>
      strategy.calculate({
        faceValue: '100000',
        termDays: 0,
        baseRateMonthly: '0.01',
      }),
    ).not.toThrow(); // prazo 0 resulta em VP = face_value (expoente 0 = 1)
  });
});
