import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCedentes1000000000003 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE risk_tier_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH');

      CREATE TABLE cedentes (
        id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cnpj      VARCHAR(14)     NOT NULL UNIQUE,
        name      VARCHAR(150)    NOT NULL,
        risk_tier risk_tier_enum  NOT NULL DEFAULT 'MEDIUM'
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE cedentes`);
    await queryRunner.query(`DROP TYPE risk_tier_enum`);
  }
}
