import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { StatementFilterDto } from './dto/statement-filter.dto';

@Injectable()
export class TransactionRepository extends Repository<Transaction> {
  constructor(dataSource: DataSource) {
    super(Transaction, dataSource.createEntityManager());
  }

  async getStatement(filter: StatementFilterDto) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;

    const query = this.createQueryBuilder('t')
      .leftJoinAndSelect('t.cedente', 'c')
      .leftJoinAndSelect('t.receivable_type', 'rt');

    if (filter.cedente_id) {
      query.andWhere('t.cedente_id = :cedenteId', {
        cedenteId: filter.cedente_id,
      });
    }
    if (filter.currency) {
      query.andWhere('t.payment_currency = :currency', {
        currency: filter.currency.toUpperCase(),
      });
    }
    if (filter.from) {
      query.andWhere('t.created_at >= :from', { from: filter.from });
    }
    if (filter.to) {
      query.andWhere('t.created_at <= :to', { to: filter.to });
    }

    query
      .orderBy('t.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await query.getManyAndCount();
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }
}
