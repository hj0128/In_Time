import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Party } from '../party/party.entity';
import { Map } from '../map/map.entity';

@Entity()
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  place: string;

  @Column()
  date: string;

  @Column()
  fine: number;

  @Column()
  fineType: string;

  @ManyToOne(() => Party, (party) => party.plans)
  party: Party;

  @OneToOne(() => Map)
  map: Map;
}
