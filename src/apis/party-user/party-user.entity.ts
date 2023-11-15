import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Party } from '../party/party.entity';
import { User } from '../user/user.entity';

@Entity()
export class Party_User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Party, (party) => party.partyUsers)
  party: Party;

  @ManyToOne(() => User, (user) => user.partyUsers)
  user: User;
}
