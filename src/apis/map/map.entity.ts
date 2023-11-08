import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Plan } from '../plan/plan.entity';

@Entity()
export class Map {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  placeName: string;

  @Column()
  placeAddress: string;

  @Column()
  placeLat: number;

  @Column()
  placeLng: number;

  @Column()
  members: string;

  @JoinColumn()
  @OneToOne(() => Plan)
  plans: Plan[];
}
