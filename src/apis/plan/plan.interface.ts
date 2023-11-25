import { JwtReqUser } from '../../commons/interface/req.interface';
import { PlanCreateDto } from './plan.dto';

export interface IPlanServiceFindOneWithPlanID {
  planID: string;
}

export interface IPlanServiceFindWithPartyID {
  partyID: string;
}

export interface IPlanServiceFindWithUserIDAndPartyID {
  user: JwtReqUser['user'];
}

export interface IPlanServiceCreate {
  planCreateDto: PlanCreateDto;
}
