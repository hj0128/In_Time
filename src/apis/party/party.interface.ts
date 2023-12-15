import { JwtReqUser } from '../../commons/interface/req.interface';
import {
  PartyCreateDto,
  PartyDeleteDto,
  PartySoftDeleteDto,
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

export interface IPartyServiceSoftDelete {
  partySoftDeleteDto: PartySoftDeleteDto;
}

export interface IPartyServiceDelete {
  partyDeleteDto: PartyDeleteDto;
}
