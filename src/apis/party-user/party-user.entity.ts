import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Party } from '../party/party.entity';
import { User } from '../user/user.entity';

@Entity()
export class Party_User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Party, (party) => party.partyUsers, { onDelete: 'CASCADE' })
  party: Party;

  @ManyToOne(() => User, (user) => user.partyUsers, { onDelete: 'CASCADE' })
  user: User;
}
