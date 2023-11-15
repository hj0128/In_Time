import { JwtReqUser } from '../auth/auth.interface';

export interface IPartyUserServiceFindAllWithUserID {
  user: JwtReqUser['user'];
}

export interface IPartyUserServiceCreate {
  partyUserRelations: { party: { id: string }; user: { id: string } };
}
