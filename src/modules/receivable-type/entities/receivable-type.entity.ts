import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('receivable_types')
export class ReceivableType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'numeric', precision: 20, scale: 6 })
  spread_monthly: string;
}
