import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Plan } from './plan.entity';
import { In, Repository } from 'typeorm';
import {
  IPlanServiceCreate,
  IPlanServiceFindOneWithPlanID,
  IPlanServiceFindWithPartyID,
  IPlanServiceFindWithUserIDAndPartyID,
} from './plan.interface';
import { Party_UserService } from '../party-user/party-user.service';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,

    private readonly partyUserService: Party_UserService,
  ) {}

  findOneWithPlanID({ planID }: IPlanServiceFindOneWithPlanID): Promise<Plan> {
    return this.planRepository.findOne({
      where: { id: planID },
      relations: ['party'],
    });
  }

  findWithPartyID({ partyID }: IPlanServiceFindWithPartyID): Promise<Plan[]> {
    return this.planRepository.find({ where: { party: { id: partyID } } });
  }

  async findWithUserIDAndPartyID({ user }: IPlanServiceFindWithUserIDAndPartyID): Promise<Plan[]> {
    const partyUsers = await this.partyUserService.findAllWithUserID({ userID: user.id });
    const partyIds = partyUsers?.map((el) => el.party.id);

    const plans = await this.planRepository.find({
      where: { party: { id: In(partyIds) } },
    });

    return plans;
  }

  async create({ planCreateDto }: IPlanServiceCreate): Promise<Plan> {
    const { planName, placeName, placeAddress, placeLat, placeLng, date, fine, fineType, partyID } =
      planCreateDto;

    const plan = await this.planRepository.save({
      planName,
      placeName,
      placeAddress,
      placeLat,
      placeLng,
      date,
      fine,
      fineType,
      party: { id: partyID },
    });
    if (!plan) throw new Error('plan 생성에 실패하였습니다.');

    return plan;
  }
}
