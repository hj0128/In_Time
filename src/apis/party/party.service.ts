import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Party } from './party.entity';
import { DataSource, Repository } from 'typeorm';
import {
  IPartyServiceUpdateAndUserAndPlan,
  IPartyServiceCreate,
  IPartyServiceFindOneWithPartyID,
  IPartyServiceFindWithUserID,
  PartyList,
  IPartyServiceDelete,
  IPartyServiceRestore,
} from './party.interface';
import { Party_UserService } from '../party-user/party-user.service';
import { PlanService } from '../plan/plan.service';
import { PointService } from '../point/point.service';
import { Plan } from '../plan/plan.entity';

@Injectable()
export class PartyService {
  constructor(
    @InjectRepository(Party)
    private readonly partyRepository: Repository<Party>,

    private readonly partyUserService: Party_UserService,
    private readonly planService: PlanService,
    private readonly pointService: PointService,
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
    const { planID, users } = partyUpdateAndUserAndPlanDto;

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
          await this.pointService.fine({
            pointFineDto: {
              userName: user,
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

  async delete({ partyDeleteDto }: IPartyServiceDelete): Promise<boolean> {
    if (Number(partyDeleteDto.point) > 0) {
      throw new BadRequestException('포인트 보유');
    }

    const result = await this.partyRepository.softDelete({ id: partyDeleteDto.partyID });
    if (!result) throw new InternalServerErrorException('삭제에 실패하였습니다.');

    return result.affected ? true : false;
  }

  async restore({ partyRestoreDto }: IPartyServiceRestore): Promise<boolean> {
    const result = await this.partyRepository.restore({ id: partyRestoreDto.partyID });
    if (!result) throw new InternalServerErrorException('복구에 실패하였습니다.');

    return result.affected ? true : false;
  }
}
