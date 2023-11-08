import { PlanCreateDto } from './plan.dto';

export interface IPlanServiceFindOneWithPlanID {
  planID: string;
}

export interface IPlanServiceFindWithPartyID {
  partyID: string;
}

export interface IPlanServiceCreate {
  planCreateDto: PlanCreateDto;
}
