import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('investments')
export class Investment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.investments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('decimal', { precision: 10, scale: 2 })
  initialValue: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  currentValue: number;

  @CreateDateColumn()
  creationDate: Date;

  @Column({ default: true })
  isActive: boolean;
}
