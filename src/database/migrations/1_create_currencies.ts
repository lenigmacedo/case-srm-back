import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCurrencies1000000000001 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE currencies (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code        VARCHAR(10)      NOT NULL UNIQUE,
        name        VARCHAR(50)      NOT NULL,
        rate_to_brl NUMERIC(20, 6)   NOT NULL,
        updated_at  TIMESTAMPTZ      NOT NULL DEFAULT NOW()
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE currencies`);
  }
}
