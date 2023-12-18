import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Party } from '../party/party.entity';

export enum PARTY_POINT_STATUS {
  FINE_RECEIVE = 'FINE_RECEIVE',
  USER_SEND = 'USER_SEND',
}

@Entity()
export class Party_Point {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userName: string;

  @Column()
  amount: number;

  @Column({ type: 'enum', enum: PARTY_POINT_STATUS })
  status: PARTY_POINT_STATUS;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Party, (party) => party.partyPoints, { onDelete: 'CASCADE' })
  party: Party;
}
