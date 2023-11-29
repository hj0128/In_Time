import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Party_User } from './party-user.entity';
import { InsertResult, Repository } from 'typeorm';
import {
  IPartyUserServiceCreate,
  IPartyUserServiceFindAllWithPartyID,
  IPartyUserServiceFindAllWithUserID,
} from './party-user.interface';

@Injectable()
export class Party_UserService {
  constructor(
    @InjectRepository(Party_User)
    private readonly partyUserRepository: Repository<Party_User>, //
  ) {}

  findAllWithUserID({ userID }: IPartyUserServiceFindAllWithUserID): Promise<Party_User[]> {
    return this.partyUserRepository.find({
      where: { user: { id: userID } },
      relations: ['party'],
    });
  }

  findAllWithPartyID({ partyID }: IPartyUserServiceFindAllWithPartyID): Promise<Party_User[]> {
    return this.partyUserRepository.find({
      where: { party: { id: partyID } },
      relations: ['user'],
    });
  }

  async create({
    partyUserRelations,
    queryRunner,
  }: IPartyUserServiceCreate): Promise<InsertResult> {
    try {
      const partyUser = await queryRunner.manager.insert(Party_User, partyUserRelations);
      return partyUser;
    } catch (error) {
      throw new InternalServerErrorException('파티-유저 테이블 생성에 실패하였습니다.');
    }
  }
}
