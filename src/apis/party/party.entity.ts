import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Plan } from '../plan/plan.entity';
import { Min } from 'class-validator';
import { Party_User } from '../party-user/party-user.entity';
import { Chat } from '../chat/chat.entity';

@Entity()
export class Party {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Min(0)
  @Column({ default: 0 })
  point: number;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Plan, (plans) => plans.party, { cascade: true })
  plans: Plan[];

  @OneToMany(() => Party_User, (partyUsers) => partyUsers.party, { cascade: true })
  partyUsers: Party_User[];

  @OneToMany(() => Chat, (chats) => chats.party, { cascade: true })
  chats: Chat[];
}
