import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum RiskTier {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

@Entity('cedentes')
export class Cedente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 14, unique: true })
  cnpj: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'enum', enum: RiskTier, default: RiskTier.MEDIUM })
  risk_tier: RiskTier;
}
