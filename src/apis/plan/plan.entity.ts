import { Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Party } from '../party/party.entity';
import { Min } from 'class-validator';

@Entity()
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  planName: string;

  @Column()
  placeName: string;

  @Column()
  placeAddress: string;

  @Column({ type: 'decimal', precision: 18, scale: 15 })
  placeLat: number;

  @Column({ type: 'decimal', precision: 18, scale: 15 })
  placeLng: number;

  @Column()
  date: string;

  @Min(0)
  @Column()
  fine: number;

  @Column({ default: false })
  isEnd: boolean;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Party, (party) => party.plans, { onDelete: 'CASCADE' })
  party: Party;
}
