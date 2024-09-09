import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Investment } from '../../investment/entities/investment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', select: false })
  password: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @OneToMany(() => Investment, (investment) => investment.user)
  investments: Investment[];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
