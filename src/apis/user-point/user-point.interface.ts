import { JwtReqUser } from 'src/commons/interface/req.interface';
import { PointFillDto, PointFineDto, PointSendDto } from './user-point.dto';
import { QueryRunner } from 'typeorm';

export interface IUserPointServiceFindWithUserID {
  userID: string;
}

export interface IPointServiceFindWithPartyID {
  partyID: string;
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

export interface IPointServiceCheckPoint {
  userID: string;
  amount: number;
}

export interface IPointServiceSend {
  user: JwtReqUser['user'];
  pointSendDto: PointSendDto;
}

export interface IPointServiceFine {
  pointFineDto: PointFineDto;
  queryRunner: QueryRunner;
}
