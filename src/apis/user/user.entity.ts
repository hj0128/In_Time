import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Friend } from '../friend/friend.entity';
import { Party_User } from '../party-user/party-user.entity';
import { User_Point } from '../user-point/user-point.entity';
import { User_Location } from '../user-location/user-location.entity';

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

  @OneToMany(() => User_Point, (userPoints) => userPoints.user, { cascade: true })
  userPoints: User_Point[];

  @OneToMany(() => User_Location, (userLocations) => userLocations.user, { cascade: true })
  userLocations: User_Location[];
}
