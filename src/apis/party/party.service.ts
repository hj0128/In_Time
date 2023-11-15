import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Party } from './party.entity';
import { Repository } from 'typeorm';
import {
  IPartyServiceCreate,
  IPartyServiceFindAllWithUser,
  IPartyServiceFindOneWithPartyID,
} from './party.interface';
import { Party_UserService } from '../party-user/party-user.service';

@Injectable()
export class PartyService {
  constructor(
    @InjectRepository(Party)
    private readonly partyRepository: Repository<Party>,

    private readonly partyUserService: Party_UserService,
  ) {}

  findOneWithPartyID({ partyID }: IPartyServiceFindOneWithPartyID): Promise<Party> {
    return this.partyRepository.findOne({
      where: { id: partyID },
    });
  }

  findAllWithUser({ user }: IPartyServiceFindAllWithUser): Promise<Party[]> {
    return this.partyRepository.find({
      where: { partyUsers: { user: { id: user.id } } },
    });
  }

  async create({ partyCreateDto, user }: IPartyServiceCreate): Promise<Party> {
    const { name, friendsID } = partyCreateDto;

    const party = await this.partyRepository.save({ name });
    if (!party) throw new InternalServerErrorException('파티 생성에 실패하였습니다.');

    const membersID = JSON.parse(friendsID);
    membersID.push(user.id);

    const partyUserRelations = membersID.map((el: string) => ({
      party: { id: party.id },
      user: { id: el },
    }));

    const partyUser = this.partyUserService.create({ partyUserRelations });
    if (!partyUser)
      throw new InternalServerErrorException('파티-유저 테이블 생성에 실패하였습니다.');

    return party;
  }
}
