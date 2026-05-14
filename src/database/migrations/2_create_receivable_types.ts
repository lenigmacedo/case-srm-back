import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReceivableTypes1000000000002 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE receivable_types (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code           VARCHAR(50)    NOT NULL UNIQUE,
        name           VARCHAR(100)   NOT NULL,
        spread_monthly NUMERIC(20, 6) NOT NULL
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE receivable_types`);
  }
}
