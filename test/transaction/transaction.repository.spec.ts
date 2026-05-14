import { TransactionRepository } from 'src/modules/transaction/transaction.repository';
import {
  Transaction,
  TransactionStatus,
} from 'src/modules/transaction/entities/transaction.entity';
import { StatementFilterDto } from 'src/modules/transaction/dto/statement-filter.dto';

const CEDENTE_A = 'a1b2c3d4-0000-0000-0000-000000000001';
const CEDENTE_B = 'a1b2c3d4-0000-0000-0000-000000000002';

function buildTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: crypto.randomUUID(),
    face_value: '100000.000000',
    present_value: '97500.000000',
    discount_amount: '2500.000000',
    discount_rate: '0.025000',
    term_days: 30,
    due_date: '2025-12-31',
    base_rate_monthly: '0.010000',
    payment_currency: 'BRL',
    origin_currency: 'BRL',
    fx_rate: null,
    status: TransactionStatus.LIQUIDATED,
    cedente_id: CEDENTE_A,
    receivable_type_id: 'rt-uuid-0001',
    cedente: null as any,
    receivable_type: null as any,
    version: 1,
    created_at: new Date('2025-06-15T10:00:00Z'),
    updated_at: new Date('2025-06-15T10:00:00Z'),
    ...overrides,
  };
}

function buildTransactions(
  count: number,
  overrides: Partial<Transaction> = {},
): Transaction[] {
  return Array.from({ length: count }, (_, i) =>
    buildTransaction({
      id: `00000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`,
      created_at: new Date(Date.now() - i * 60_000),
      ...overrides,
    }),
  );
}

function makeMockQb(items: Transaction[], total: number) {
  return {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([items, total]),
  };
}

describe('TransactionRepository', () => {
  let repo: TransactionRepository;
  let mockQb: ReturnType<typeof makeMockQb>;

  beforeEach(() => {
    const mockDataSource = {
      createEntityManager: jest.fn().mockReturnValue({}),
    } as any;
    repo = new TransactionRepository(mockDataSource);
  });

  function setup(items: Transaction[], total: number) {
    mockQb = makeMockQb(items, total);
    jest.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQb as any);
  }

  // ─── Padrão sem filtros ───────────────────────────────────────────────────

  describe('sem filtros', () => {
    it('usa página 1 e limit 20 por padrão', async () => {
      setup(buildTransactions(20), 100);
      await repo.getStatement({});
      expect(mockQb.skip).toHaveBeenCalledWith(0);
      expect(mockQb.take).toHaveBeenCalledWith(20);
    });

    it('não aplica nenhum andWhere', async () => {
      setup([], 0);
      await repo.getStatement({});
      expect(mockQb.andWhere).not.toHaveBeenCalled();
    });

    it('retorna as propriedades esperadas no resultado', async () => {
      const items = buildTransactions(3);
      setup(items, 3);
      const result = await repo.getStatement({});
      expect(result).toEqual({ items, total: 3, page: 1, limit: 20, pages: 1 });
    });

    it('ordena por created_at DESC', async () => {
      setup([], 0);
      await repo.getStatement({});
      expect(mockQb.orderBy).toHaveBeenCalledWith('t.created_at', 'DESC');
    });

    it('faz join com cedente e receivable_type', async () => {
      setup([], 0);
      await repo.getStatement({});
      expect(mockQb.leftJoinAndSelect).toHaveBeenCalledWith('t.cedente', 'c');
      expect(mockQb.leftJoinAndSelect).toHaveBeenCalledWith(
        't.receivable_type',
        'rt',
      );
    });
  });

  // ─── Filtro por cedente_id ────────────────────────────────────────────────

  describe('filtro por cedente_id', () => {
    it('aplica andWhere com cedente_id quando informado', async () => {
      setup([], 0);
      await repo.getStatement({ cedente_id: CEDENTE_A });
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        't.cedente_id = :cedenteId',
        { cedenteId: CEDENTE_A },
      );
    });

    it('não aplica andWhere de cedente quando omitido', async () => {
      setup([], 0);
      await repo.getStatement({ currency: 'BRL' });
      const calls: string[] = mockQb.andWhere.mock.calls.map(
        ([clause]: [string]) => clause,
      );
      expect(calls.some((c) => c.includes('cedente_id'))).toBe(false);
    });

    it('isola resultados por cedente — CEDENTE_A não vê transações de CEDENTE_B', async () => {
      const cedenteAItems = buildTransactions(5, { cedente_id: CEDENTE_A });
      setup(cedenteAItems, 5);
      const result = await repo.getStatement({ cedente_id: CEDENTE_A });
      expect(result.total).toBe(5);
      expect(result.items.every((t) => t.cedente_id === CEDENTE_A)).toBe(true);
    });
  });

  // ─── Filtro por currency ──────────────────────────────────────────────────

  describe('filtro por currency', () => {
    it('aplica andWhere com currency em maiúsculas', async () => {
      setup([], 0);
      await repo.getStatement({ currency: 'BRL' });
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        't.payment_currency = :currency',
        { currency: 'BRL' },
      );
    });

    it('converte currency minúscula para maiúsculas', async () => {
      setup([], 0);
      await repo.getStatement({ currency: 'usd' });
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        't.payment_currency = :currency',
        { currency: 'USD' },
      );
    });

    it('converte currency mista para maiúsculas', async () => {
      setup([], 0);
      await repo.getStatement({ currency: 'Eur' });
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        't.payment_currency = :currency',
        { currency: 'EUR' },
      );
    });

    it('não aplica andWhere de currency quando omitida', async () => {
      setup([], 0);
      await repo.getStatement({ cedente_id: CEDENTE_A });
      const calls: string[] = mockQb.andWhere.mock.calls.map(
        ([clause]: [string]) => clause,
      );
      expect(calls.some((c) => c.includes('payment_currency'))).toBe(false);
    });
  });

  // ─── Filtro por data ──────────────────────────────────────────────────────

  describe('filtro por data', () => {
    it('aplica andWhere com from quando informado', async () => {
      setup([], 0);
      await repo.getStatement({ from: '2025-01-01' });
      expect(mockQb.andWhere).toHaveBeenCalledWith('t.created_at >= :from', {
        from: '2025-01-01',
      });
    });

    it('aplica andWhere com to quando informado', async () => {
      setup([], 0);
      await repo.getStatement({ to: '2025-12-31' });
      expect(mockQb.andWhere).toHaveBeenCalledWith('t.created_at <= :to', {
        to: '2025-12-31',
      });
    });

    it('aplica from e to simultaneamente para range de datas', async () => {
      setup([], 0);
      await repo.getStatement({ from: '2025-01-01', to: '2025-06-30' });
      const clauses: string[] = mockQb.andWhere.mock.calls.map(
        ([c]: [string]) => c,
      );
      expect(clauses).toContain('t.created_at >= :from');
      expect(clauses).toContain('t.created_at <= :to');
    });

    it('não aplica andWhere de data quando from e to são omitidos', async () => {
      setup([], 0);
      await repo.getStatement({ cedente_id: CEDENTE_A });
      const calls: string[] = mockQb.andWhere.mock.calls.map(
        ([clause]: [string]) => clause,
      );
      expect(calls.some((c) => c.includes('created_at'))).toBe(false);
    });
  });

  // ─── Todos os filtros combinados ──────────────────────────────────────────

  describe('todos os filtros combinados', () => {
    const fullFilter: StatementFilterDto = {
      cedente_id: CEDENTE_A,
      currency: 'usd',
      from: '2025-01-01',
      to: '2025-12-31',
      page: 2,
      limit: 10,
    };

    it('aplica exatamente 4 condições andWhere', async () => {
      setup([], 0);
      await repo.getStatement(fullFilter);
      expect(mockQb.andWhere).toHaveBeenCalledTimes(4);
    });

    it('aplica cedente_id, currency (uppercased), from e to', async () => {
      setup([], 0);
      await repo.getStatement(fullFilter);
      const calls: [string, object][] = mockQb.andWhere.mock.calls;
      const clauses = calls.map(([c]) => c);
      expect(clauses).toContain('t.cedente_id = :cedenteId');
      expect(clauses).toContain('t.payment_currency = :currency');
      expect(clauses).toContain('t.created_at >= :from');
      expect(clauses).toContain('t.created_at <= :to');
      const currencyCall = calls.find(([c]) => c.includes('payment_currency'));
      expect(currencyCall![1]).toEqual({ currency: 'USD' });
    });
  });

  // ─── Paginação ────────────────────────────────────────────────────────────

  describe('paginação', () => {
    it('página 1, limit 20 → skip=0, take=20', async () => {
      setup(buildTransactions(20), 100);
      await repo.getStatement({ page: 1, limit: 20 });
      expect(mockQb.skip).toHaveBeenCalledWith(0);
      expect(mockQb.take).toHaveBeenCalledWith(20);
    });

    it('página 2, limit 20 → skip=20, take=20', async () => {
      setup(buildTransactions(20), 100);
      await repo.getStatement({ page: 2, limit: 20 });
      expect(mockQb.skip).toHaveBeenCalledWith(20);
      expect(mockQb.take).toHaveBeenCalledWith(20);
    });

    it('página 3, limit 10 → skip=20, take=10', async () => {
      setup(buildTransactions(10), 50);
      await repo.getStatement({ page: 3, limit: 10 });
      expect(mockQb.skip).toHaveBeenCalledWith(20);
      expect(mockQb.take).toHaveBeenCalledWith(10);
    });

    it('página 5, limit 20 → skip=80, take=20', async () => {
      setup(buildTransactions(20), 200);
      await repo.getStatement({ page: 5, limit: 20 });
      expect(mockQb.skip).toHaveBeenCalledWith(80);
      expect(mockQb.take).toHaveBeenCalledWith(20);
    });

    it('limit customizado de 50 → take=50', async () => {
      setup(buildTransactions(50), 500);
      await repo.getStatement({ page: 1, limit: 50 });
      expect(mockQb.take).toHaveBeenCalledWith(50);
    });

    it('retorna page e limit no resultado para validação pelo cliente', async () => {
      setup(buildTransactions(5), 5);
      const result = await repo.getStatement({ page: 3, limit: 7 });
      expect(result.page).toBe(3);
      expect(result.limit).toBe(7);
    });
  });

  // ─── Cálculo de pages ─────────────────────────────────────────────────────

  describe('cálculo de pages', () => {
    async function pages(total: number, limit: number): Promise<number> {
      setup([], total);
      const result = await repo.getStatement({ limit });
      return result.pages;
    }

    it('100 itens, limit 20 → 5 páginas', async () => {
      expect(await pages(100, 20)).toBe(5);
    });

    it('101 itens, limit 20 → 6 páginas (ceil)', async () => {
      expect(await pages(101, 20)).toBe(6);
    });

    it('1000 itens, limit 20 → 50 páginas', async () => {
      expect(await pages(1000, 20)).toBe(50);
    });

    it('1 item, limit 20 → 1 página', async () => {
      expect(await pages(1, 20)).toBe(1);
    });

    it('0 itens → 0 páginas', async () => {
      expect(await pages(0, 20)).toBe(0);
    });

    it('19 itens, limit 20 → 1 página', async () => {
      expect(await pages(19, 20)).toBe(1);
    });

    it('21 itens, limit 20 → 2 páginas', async () => {
      expect(await pages(21, 20)).toBe(2);
    });

    it('1 item, limit 1 → 1 página', async () => {
      expect(await pages(1, 1)).toBe(1);
    });
  });

  // ─── Simulando volume grande ──────────────────────────────────────────────

  describe('simulando volume grande', () => {
    it('500 transações — página 3 com limit 50 retorna fatia correta', async () => {
      const page3Items = buildTransactions(50, { cedente_id: CEDENTE_A });
      setup(page3Items, 500);
      const result = await repo.getStatement({ page: 3, limit: 50 });
      expect(mockQb.skip).toHaveBeenCalledWith(100);
      expect(mockQb.take).toHaveBeenCalledWith(50);
      expect(result.total).toBe(500);
      expect(result.pages).toBe(10);
      expect(result.items).toHaveLength(50);
    });

    it('1000 transações — última página (limit 100) tem skip=900', async () => {
      const lastPageItems = buildTransactions(100);
      setup(lastPageItems, 1000);
      const result = await repo.getStatement({ page: 10, limit: 100 });
      expect(mockQb.skip).toHaveBeenCalledWith(900);
      expect(result.pages).toBe(10);
    });

    it('250 transações de CEDENTE_A + 250 de CEDENTE_B — filtra apenas CEDENTE_A', async () => {
      const cedenteAItems = buildTransactions(20, { cedente_id: CEDENTE_A });
      setup(cedenteAItems, 250);
      const result = await repo.getStatement({
        cedente_id: CEDENTE_A,
        page: 1,
        limit: 20,
      });
      expect(result.total).toBe(250);
      expect(result.pages).toBe(13);
      expect(result.items.every((t) => t.cedente_id === CEDENTE_A)).toBe(true);
    });

    it('1000 transações em BRL e 500 em USD — filtra apenas USD', async () => {
      const usdItems = buildTransactions(20, { payment_currency: 'USD' });
      setup(usdItems, 500);
      const result = await repo.getStatement({ currency: 'usd', limit: 20 });
      expect(result.total).toBe(500);
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        't.payment_currency = :currency',
        { currency: 'USD' },
      );
    });

    it('range de data filtra corretamente em base com 800 transações', async () => {
      const rangeItems = buildTransactions(20);
      setup(rangeItems, 120);
      const result = await repo.getStatement({
        from: '2025-03-01',
        to: '2025-03-31',
        limit: 20,
      });
      expect(result.total).toBe(120);
      expect(result.pages).toBe(6);
    });

    it('combinação de todos os filtros em base grande retorna slice preciso', async () => {
      const items = buildTransactions(10, {
        cedente_id: CEDENTE_B,
        payment_currency: 'EUR',
      });
      setup(items, 47);
      const result = await repo.getStatement({
        cedente_id: CEDENTE_B,
        currency: 'eur',
        from: '2025-01-01',
        to: '2025-12-31',
        page: 2,
        limit: 10,
      });
      expect(mockQb.andWhere).toHaveBeenCalledTimes(4);
      expect(mockQb.skip).toHaveBeenCalledWith(10);
      expect(result.total).toBe(47);
      expect(result.pages).toBe(5);
    });
  });
});
