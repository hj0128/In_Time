import { JwtReqUser } from '../../commons/interface/req.interface';
import { PlanCreateDto, PlanDeleteDto, PlanRestoreDto } from './plan.dto';

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

export interface IPlanServiceCheckEnd {
  planID: string;
}

export interface IPlanServiceDelete {
  planDeleteDto: PlanDeleteDto;
}

export interface IPlanServiceResotre {
  planRestoreDto: PlanRestoreDto;
}
