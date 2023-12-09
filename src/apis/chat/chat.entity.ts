import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { Party } from '../party/party.entity';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  userName: string;

  @Column()
  message: string;

  @Column()
  room: string;

  @CreateDateColumn()
  timestamp: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Party, (party) => party.chats, { onDelete: 'CASCADE' })
  party: Party;
}
