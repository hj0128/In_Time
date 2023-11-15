import { JwtReqUser } from '../auth/auth.interface';
import { PartyCreateDto } from './party.dto';

export interface IPartyServiceFindOneWithPartyID {
  partyID: string;
}

export interface IPartyServiceFindAllWithUser {
  user: JwtReqUser['user'];
}

export interface IPartyServiceCreate {
  partyCreateDto: PartyCreateDto;
  user: JwtReqUser['user'];
}
