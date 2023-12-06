import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';

export enum POINT_STATUS {
  POINT_FILL = 'POINT_FILL',
  POINT_SEND = 'POINT_SEND',
  FINE = 'FINE',
}

@Entity()
export class Point {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  impUid: string;

  @Column()
  amount: number;

  @Column({ type: 'enum', enum: POINT_STATUS })
  status: POINT_STATUS;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.points, { onDelete: 'CASCADE' })
  user: User;
}
