import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Friend } from '../friend/friend.entity';
import { Party_User } from '../party-user/party-user.entity';
import { Point } from '../point/point.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: 0 })
  point: number;

  @Column()
  profileUrl: string;

  @Column({ default: 'https://storage.googleapis.com/in-time-project-bucket/defaults/tardy.png' })
  badgeUrl: string;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Friend, (friend) => friend.user, { cascade: true })
  friends: Friend[];

  @OneToMany(() => Party_User, (partyUsers) => partyUsers.user, { cascade: true })
  partyUsers: Party_User[];

  @OneToMany(() => Point, (points) => points.user, { cascade: true })
  points: Point[];
}
