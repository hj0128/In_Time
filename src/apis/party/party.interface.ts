import { JwtReqUser } from '../../commons/interface/req.interface';
import {
  PartyCreateDto,
  PartyDeleteDto,
  PartyRestoreDto,
  PartyUpdateAndUserAndPlanDto,
} from './party.dto';

export interface IPartyServiceFindOneWithPartyID {
  partyID: string;
}

export interface IPartyServiceFindWithUserID {
  userID: string;
}

export interface PartyList {
  partyID: string;
  name: string;
  point: number;
  members: string[];
}

export interface IPartyServiceCreate {
  partyCreateDto: PartyCreateDto;
  user: JwtReqUser['user'];
}

export interface IPartyServiceUpdateAndUserAndPlan {
  partyUpdateAndUserAndPlanDto: PartyUpdateAndUserAndPlanDto;
}

export interface IPartyServiceDelete {
  partyDeleteDto: PartyDeleteDto;
}

export interface IPartyServiceRestore {
  partyRestoreDto: PartyRestoreDto;
}
