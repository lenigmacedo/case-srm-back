import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { Cedente } from '../../cedente/entities/cedente.entity';
import { ReceivableType } from '../../receivable-type/entities/receivable-type.entity';

export enum TransactionStatus {
  PENDING = 'PENDING',
  LIQUIDATED = 'LIQUIDATED',
  CANCELLED = 'CANCELLED',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'numeric', precision: 20, scale: 6 })
  face_value: string;

  @Column({ type: 'numeric', precision: 20, scale: 6 })
  present_value: string;

  @Column({ type: 'numeric', precision: 20, scale: 6 })
  discount_amount: string;

  @Column({ type: 'numeric', precision: 20, scale: 6 })
  discount_rate: string;

  @Column({ type: 'int' })
  term_days: number;

  @Column({ type: 'date' })
  due_date: string;

  @Column({ type: 'numeric', precision: 20, scale: 6 })
  base_rate_monthly: string;

  @Column({ type: 'varchar', length: 10 })
  payment_currency: string;

  @Column({ type: 'varchar', length: 10, default: 'BRL' })
  origin_currency: string;

  @Column({ type: 'numeric', precision: 20, scale: 6, nullable: true })
  fx_rate: string | null;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @ManyToOne(() => Cedente, { eager: false, nullable: false })
  @JoinColumn({ name: 'cedente_id' })
  cedente: Cedente;

  @Column({ type: 'uuid' })
  cedente_id: string;

  @ManyToOne(() => ReceivableType, { eager: false, nullable: false })
  @JoinColumn({ name: 'receivable_type_id' })
  receivable_type: ReceivableType;

  @Column({ type: 'uuid' })
  receivable_type_id: string;

  @VersionColumn()
  version: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
