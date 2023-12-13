import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Party_User } from './party-user.entity';
import { InsertResult, Repository } from 'typeorm';
import {
  IPartyUserServiceCheckPartyMembers,
  IPartyUserServiceCreate,
  IPartyUserServiceFindAllWithPartyID,
  IPartyUserServiceFindAllWithUserID,
} from './party-user.interface';
import { PartyService } from '../party/party.service';

@Injectable()
export class Party_UserService {
  constructor(
    @InjectRepository(Party_User)
    private readonly partyUserRepository: Repository<Party_User>,

    @Inject(forwardRef(() => PartyService))
    private readonly partyService: PartyService,
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
      relations: ['user', 'party'],
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

  async checkPartyMembers({ userID }: IPartyUserServiceCheckPartyMembers): Promise<void> {
    const partyUsers = await this.findAllWithUserID({ userID });

    await Promise.all(
      partyUsers.map(async (el) => {
        const partyUsers = await this.findAllWithPartyID({ partyID: el.party.id });

        if (partyUsers.length <= 1) {
          throw new ForbiddenException(
            `${partyUsers[0].party.name}파티를 관리할 멤버가 없습니다.\n해당 파티를 삭제 후 탈퇴해 주세요.`,
          );
        }
      }),
    );
  }
}
