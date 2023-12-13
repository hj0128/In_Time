import { Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';

export enum STATUS_ENUM {
  SENT = 'SENT',
  FRIENDSHIP = 'FRIENDSHIP',
}

@Entity()
export class Friend {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  toUserID: string;

  @Column({ type: 'enum', enum: STATUS_ENUM })
  isAccepted: STATUS_ENUM;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.friends, { onDelete: 'CASCADE' })
  user: User;
}
