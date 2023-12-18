import { Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class User_Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 18, scale: 15 })
  lat: number;

  @Column({ type: 'decimal', precision: 18, scale: 15 })
  lng: number;

  @Column()
  time: string;

  @Column()
  isArrive: boolean;

  @Column()
  planID: string;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.userLocations, { onDelete: 'CASCADE' })
  user: User;
}
