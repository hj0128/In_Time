import { JwtReqUser } from 'src/commons/interface/req.interface';
import { PartyPointUserSendDto } from './party-point.dto';

export interface IPartyPointServiceFindWithPartyID {
  partyID: string;
}

export interface IPartyPointServiceUserSend {
  user: JwtReqUser['user'];
  partyPointUserSendDto: PartyPointUserSendDto;
}
