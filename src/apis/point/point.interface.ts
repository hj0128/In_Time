import { JwtReqUser } from 'src/commons/interface/req.interface';
import { PointFillDto, PointSendDto } from './point.dto';

export interface IPointServiceFindWithUserID {
  userID: string;
}

export interface IPointServiceFindOneWithImpUid {
  impUid: string;
}

export interface IPointServiceCheckDuplication {
  impUid: string;
}

export interface IPointServiceFill {
  user: JwtReqUser['user'];
  pointFillDto: PointFillDto;
}

export interface IPointServiceEmpty {
  user: JwtReqUser['user'];
  pointSendDto: PointSendDto;
}
