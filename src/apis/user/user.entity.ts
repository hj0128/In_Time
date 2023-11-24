import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Friend } from '../friend/friend.entity';
import { Party_User } from '../party-user/party-user.entity';

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

  @Column()
  profileUrl: string;

  @Column({ default: 'http://badgeUrl.jpg' })
  badgeUrl: string;

  @OneToMany(() => Friend, (friend) => friend.user, { cascade: true })
  friends: Friend[];

  @OneToMany(() => Party_User, (partyUsers) => partyUsers.user, { cascade: true })
  partyUsers: Party_User[];
}
