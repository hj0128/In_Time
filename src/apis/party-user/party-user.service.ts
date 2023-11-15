import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Party_User } from './party-user.entity';
import { InsertResult, Repository } from 'typeorm';
import {
  IPartyUserServiceCreate,
  IPartyUserServiceFindAllWithUserID,
} from './party-user.interface';

@Injectable()
export class Party_UserService {
  constructor(
    @InjectRepository(Party_User)
    private readonly partyUserRepository: Repository<Party_User>, //
  ) {}

  findAllWithUserID({ user }: IPartyUserServiceFindAllWithUserID): Promise<Party_User[]> {
    return this.partyUserRepository.find({
      where: { user: { id: user.id } },
      relations: ['party'],
    });
  }

  create({ partyUserRelations }: IPartyUserServiceCreate): Promise<InsertResult> {
    return this.partyUserRepository.insert(partyUserRelations);
  }
}
