import { JwtReqUser } from 'src/commons/interface/req.interface';
import { PointFillDto, PointFineDto, PointSendDto } from './point.dto';
import { QueryRunner } from 'typeorm';

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
