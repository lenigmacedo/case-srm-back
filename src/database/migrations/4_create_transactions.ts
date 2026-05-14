import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransactions1000000000004 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE transaction_status_enum AS ENUM ('PENDING', 'LIQUIDATED', 'CANCELLED');

      CREATE TABLE transactions (
        id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        face_value         NUMERIC(20, 6)          NOT NULL,
        present_value      NUMERIC(20, 6)          NOT NULL,
        discount_amount    NUMERIC(20, 6)          NOT NULL,
        discount_rate      NUMERIC(20, 6)          NOT NULL,
        term_days          INT                     NOT NULL,
        due_date           DATE                    NOT NULL,
        base_rate_monthly  NUMERIC(20, 6)          NOT NULL,
        payment_currency   VARCHAR(10)             NOT NULL,
        origin_currency    VARCHAR(10)             NOT NULL DEFAULT 'BRL',
        fx_rate            NUMERIC(20, 6),
        status             transaction_status_enum NOT NULL DEFAULT 'PENDING',
        cedente_id         UUID                    NOT NULL REFERENCES cedentes(id),
        receivable_type_id UUID                    NOT NULL REFERENCES receivable_types(id),
        version            INT                     NOT NULL DEFAULT 0,
        created_at         TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
        updated_at         TIMESTAMPTZ             NOT NULL DEFAULT NOW()
      );

      CREATE INDEX idx_transactions_cedente_currency_date
        ON transactions (cedente_id, payment_currency, created_at DESC);
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE transactions`);
    await queryRunner.query(`DROP TYPE transaction_status_enum`);
  }
}
