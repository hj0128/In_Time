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
import { MapService } from '../map/map.service';
import { Party_UserService } from '../party-user/party-user.service';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,

    private readonly mapService: MapService,
    private readonly partyUserService: Party_UserService,
  ) {}

  findOneWithPlanID({ planID }: IPlanServiceFindOneWithPlanID): Promise<Plan> {
    if (!planID) throw new BadRequestException('올바르지 않은 접근입니다.');

    return this.planRepository.findOne({ where: { id: planID } });
  }

  findWithPartyID({ partyID }: IPlanServiceFindWithPartyID): Promise<Plan[]> {
    if (!partyID) throw new BadRequestException('올바르지 않은 접근입니다.');

    return this.planRepository.find({ where: { party: { id: partyID } } });
  }

  async findWithUserIDAndPartyID({ user }: IPlanServiceFindWithUserIDAndPartyID): Promise<Plan[]> {
    const partyUsers = await this.partyUserService.findAllWithUserID({ user });
    const partyIds = partyUsers.map((el) => el.party.id);

    const plans = await this.planRepository.find({
      where: { party: { id: In(partyIds) } },
    });

    return plans;
  }

  async create({ planCreateDto }: IPlanServiceCreate): Promise<Plan> {
    const { partyID, name, place, date, fine, fineType, placeAddress, placeLat, placeLng } =
      planCreateDto;

    // plan 저장
    const plan = await this.planRepository.save({
      name,
      place,
      date,
      fine,
      fineType,
      party: { id: partyID },
    });
    if (!plan) throw new Error('약속 생성에 실패하였습니다.');

    // map에 저장
    this.mapService.create({
      placeName: place,
      placeAddress,
      placeLat,
      placeLng,
      partyID,
      plan: plan.id,
    });

    return plan;
  }
}
