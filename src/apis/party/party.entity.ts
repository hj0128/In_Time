import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Plan } from '../plan/plan.entity';
import { User } from '../user/user.entity';

@Entity()
export class Party {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  members: string;

  @Column({ default: 0 })
  point: number;

  @OneToMany(() => Plan, (plans) => plans.party)
  plans: Plan[];

  @ManyToOne(() => User)
  user: User;
}
