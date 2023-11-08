import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Plan } from './plan.entity';
import { Repository } from 'typeorm';
import {
  IPlanServiceCreate,
  IPlanServiceFindOneWithPlanID,
  IPlanServiceFindWithPartyID,
} from './plan.interface';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>, //
  ) {}

  findOneWithPlanID({ planID }: IPlanServiceFindOneWithPlanID): Promise<Plan> {
    return this.planRepository.findOne({ where: { id: planID } });
  }

  findWithPartyID({ partyID }: IPlanServiceFindWithPartyID): Promise<Plan[]> {
    return this.planRepository.find({ where: { party: { id: partyID } } });
  }

  async create({ planCreateDto }: IPlanServiceCreate): Promise<Plan> {
    const {
      partyID,
      name,
      place,
      date,
      fine,
      fineType,
      placeAddress,
      placeLat,
      placeLng,
    } = planCreateDto;

    // userID로 유저 정보 가져오기(별명, 이미지, 위도, 경도)

    // map에 저장

    // plan 저장

    return this.planRepository.save({
      name,
      place,
      date,
      fine,
      fineType,
      party: { id: partyID },
    });
  }
}
