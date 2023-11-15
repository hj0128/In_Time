import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Plan } from '../plan/plan.entity';

@Entity()
export class Map {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  placeName: string;

  @Column()
  placeAddress: string;

  @Column({ type: 'decimal', precision: 18, scale: 15 })
  placeLat: number;

  @Column({ type: 'decimal', precision: 18, scale: 15 })
  placeLng: number;

  @Column()
  membersName: string;

  @Column()
  membersImage: string;

  @Column({ type: 'decimal', precision: 18, scale: 15 })
  membersLat: number;

  @Column({ type: 'decimal', precision: 18, scale: 15 })
  membersLng: number;

  @JoinColumn()
  @OneToOne(() => Plan)
  plan: Plan;
}
