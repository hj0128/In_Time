import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Party } from './party.entity';
import { DataSource, Repository } from 'typeorm';
import {
  IPartyServiceCreate,
  IPartyServiceFindOneWithPartyID,
  IPartyServiceFindWithUserID,
  PartyList,
} from './party.interface';
import { Party_UserService } from '../party-user/party-user.service';

@Injectable()
export class PartyService {
  constructor(
    @InjectRepository(Party)
    private readonly partyRepository: Repository<Party>,

    private readonly partyUserService: Party_UserService,
    private readonly dataSource: DataSource,
  ) {}

  findOneWithPartyID({ partyID }: IPartyServiceFindOneWithPartyID): Promise<Party> {
    return this.partyRepository.findOne({
      where: { id: partyID },
    });
  }

  async findWithUserID({ userID }: IPartyServiceFindWithUserID): Promise<PartyList[]> {
    const parties = await this.partyRepository.find({
      where: { partyUsers: { user: { id: userID } } },
      relations: ['partyUsers'],
    });

    const partyList = [];

    if (parties) {
      await Promise.all(
        parties.map(async (el) => {
          const partyUsers = await this.partyUserService.findAllWithPartyID({ partyID: el.id });
          const members = partyUsers.map((el) => el.user.name);

          partyList.push({
            partyID: el.id,
            name: el.name,
            point: el.point,
            members,
          });
        }),
      );
    }

    return partyList;
  }

  async create({ partyCreateDto, user }: IPartyServiceCreate): Promise<Party> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ COMMITTED');

    try {
      const { name, friendsID } = partyCreateDto;

      const party = await queryRunner.manager.save(Party, { name });
      if (!party) throw new InternalServerErrorException('파티 생성에 실패하였습니다.');

      const membersID = JSON.parse(friendsID);
      membersID.push(user.id);

      const partyUserRelations = membersID.map((el: string) => ({
        party: { id: party.id },
        user: { id: el },
      }));

      const partyUser = this.partyUserService.create({ partyUserRelations, queryRunner });
      if (!partyUser)
        throw new InternalServerErrorException('파티-유저 테이블 생성에 실패하였습니다.');

      await queryRunner.commitTransaction();

      return party;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
