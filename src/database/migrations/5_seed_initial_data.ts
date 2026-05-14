import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedInitialData1000000000005 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO currencies (code, name, rate_to_brl) VALUES
        ('BRL', 'Real Brasileiro',    '1.000000'),
        ('USD', 'Dólar Americano',    '5.700000'),
        ('EUR', 'Euro',               '6.200000')
      ON CONFLICT (code) DO NOTHING;

      INSERT INTO receivable_types (code, name, spread_monthly) VALUES
        ('DUPLICATA_MERCANTIL', 'Duplicata Mercantil',  '0.015000'),
        ('CHEQUE_PRE_DATADO',   'Cheque Pré-datado',    '0.025000')
      ON CONFLICT (code) DO NOTHING;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM receivable_types`);
    await queryRunner.query(`DELETE FROM currencies`);
  }
}
