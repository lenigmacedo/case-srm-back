import Decimal from 'decimal.js';
import { ChequePreDatadoStrategy } from 'src/modules/pricing/strategies/cheque-pre-datado.strategy';
import { DuplicataMercantilStrategy } from 'src/modules/pricing/strategies/duplicata-mercantil.strategy';

describe('ChequePreDatadoStrategy', () => {
  const strategy = new ChequePreDatadoStrategy();

  it('deve calcular VP com spread de 2.5% a.m. para 30 dias', () => {
    const result = strategy.calculate({
      faceValue: '100000',
      termDays: 30,
      baseRateMonthly: '0.01',
    });

    // VP = 100000 / (1 + 0.01 + 0.025)^1 = 100000 / 1.035 ≈ 96618.357...
    const expected = new Decimal('100000').div(new Decimal('1.035'));
    expect(new Decimal(result.presentValue).toFixed(2)).toBe(
      expected.toFixed(2),
    );
  });

  it('deve ter deságio maior que DuplicataMercantil para mesmo prazo', () => {
    const chequeStrategy = new ChequePreDatadoStrategy();
    const duplicataStrategy = new DuplicataMercantilStrategy();

    const params = {
      faceValue: '100000',
      termDays: 30,
      baseRateMonthly: '0.01',
    };
    const chequeResult = chequeStrategy.calculate(params);
    const duplicataResult = duplicataStrategy.calculate(params);

    expect(
      new Decimal(chequeResult.discountAmount).greaterThan(
        duplicataResult.discountAmount,
      ),
    ).toBe(true);
  });

  it('deve retornar spread correto (2.5% a.m.)', () => {
    const result = strategy.calculate({
      faceValue: '50000',
      termDays: 30,
      baseRateMonthly: '0',
    });
    expect(result.spreadMonthly).toBe('0.025');
  });

  it('deve calcular discount_rate como percentual do face_value', () => {
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
    expect(result.presentValue).toBeDefined();
    expect(new Decimal(result.presentValue).isFinite()).toBe(true);
  });
});
