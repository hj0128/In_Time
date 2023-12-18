import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Party } from './party.entity';
import { DataSource, Repository } from 'typeorm';
import {
  IPartyServiceUpdateAndUserAndPlan,
  IPartyServiceCreate,
  IPartyServiceFindOneWithPartyID,
  IPartyServiceFindWithUserID,
  PartyList,
  IPartyServiceSoftDelete,
  IPartyServiceDelete,
} from './party.interface';
import { Party_UserService } from '../party-user/party-user.service';
import { PlanService } from '../plan/plan.service';

import { Plan } from '../plan/plan.entity';
import { Chat } from '../chat/chat.entity';
import { Party_User } from '../party-user/party-user.entity';
import { User_PointService } from '../user-point/user-point.service';
import { Party_Point } from '../party-point/party-point.entity';
import { Marker } from '../marker/marker.entity';
import { User_Location } from '../user-location/user-location.entity';

@Injectable()
export class PartyService {
  constructor(
    @InjectRepository(Party)
    private readonly partyRepository: Repository<Party>,

    @Inject(forwardRef(() => Party_UserService))
    private readonly partyUserService: Party_UserService,

    private readonly dataSource: DataSource,
    private readonly planService: PlanService,
    private readonly userPointService: User_PointService,
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

    const partyList = await Promise.all(
      parties.map(async (party) => {
        const partyUsers = await this.partyUserService.findAllWithPartyID({ partyID: party.id });
        const members = partyUsers.map((partyUser) => partyUser.user.name);

        return {
          partyID: party.id,
          name: party.name,
          point: party.point,
          members,
        };
      }),
    );

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

      const partyUser = await this.partyUserService.create({ partyUserRelations, queryRunner });
      if (!partyUser)
        throw new InternalServerErrorException('파티-유저 테이블 생성에 실패하였습니다.');

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return party;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw error;
    }
  }

  async updateAndUserAndPlan({
    partyUpdateAndUserAndPlanDto,
  }: IPartyServiceUpdateAndUserAndPlan): Promise<void> {
    const { planID, partyID, users } = partyUpdateAndUserAndPlanDto;

    const plan = await this.planService.checkEnd({ planID });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      await queryRunner.manager.save(Plan, {
        id: planID,
        isEnd: true,
      });

      await queryRunner.manager.increment(
        Party,
        { id: plan.party.id },
        'point',
        plan.fine * users.length,
      );

      await Promise.all(
        users.map(async (user) => {
          await this.userPointService.fine({
            pointFineDto: {
              userName: user,
              partyID,
              amount: plan.fine,
            },
            queryRunner,
          });
        }),
      );

      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw error;
    }
  }

  async softDelete({ partySoftDeleteDto }: IPartyServiceSoftDelete): Promise<boolean> {
    const party = await this.findOneWithPartyID({ partyID: partySoftDeleteDto.partyID });

    if (Number(party.point) > 0) {
      throw new BadRequestException('포인트 보유');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ COMMITTED');

    try {
      const plan = await queryRunner.manager.findOne(Plan, { where: { party: { id: party.id } } });

      await queryRunner.manager.softDelete(Chat, { party: { id: party.id } });

      await queryRunner.manager.softDelete(Plan, { party: { id: party.id } });

      await queryRunner.manager.softDelete(User_Location, { planID: plan.id });

      await queryRunner.manager.softDelete(Party_User, { party: { id: party.id } });

      await queryRunner.manager.softDelete(Party_Point, { party: { id: party.id } });

      await queryRunner.manager.softDelete(Marker, { party: { id: party.id } });

      const partyResult = await queryRunner.manager.softDelete(Party, {
        id: partySoftDeleteDto.partyID,
      });

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return partyResult.affected ? true : false;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw new InternalServerErrorException('파티 삭제에 실패하였습니다.');
    }
  }

  async delete({ partyDeleteDto }: IPartyServiceDelete): Promise<boolean> {
    const result = await this.partyRepository.delete({ id: partyDeleteDto.partyID });

    return result.affected ? true : false;
  }
}
