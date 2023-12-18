import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

export enum USER_POINT_STATUS {
  POINT_FILL = 'POINT_FILL',
  POINT_SEND = 'POINT_SEND',
  FINE_SEND = 'FINE_SEND',
  PARTY_RECEIVE = 'PARTY_RECEIVE',
}

@Entity()
export class User_Point {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  impUid: string;

  @Column()
  amount: number;

  @Column({ type: 'enum', enum: USER_POINT_STATUS })
  status: USER_POINT_STATUS;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.userPoints, { onDelete: 'CASCADE' })
  user: User;
}
