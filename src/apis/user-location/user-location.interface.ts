import { JwtReqUser } from 'src/commons/interface/req.interface';
import { UserLocationCreateDto } from './user-location.dto';

export interface IUserLocationServiceFindOneWithName {
  name: string;
  planID: string;
}

export interface IUserLocationServiceCreate {
  user: JwtReqUser['user'];
  userLocationCreateDto: UserLocationCreateDto;
}

export interface IUserLocationServiceFindUsersName {
  usersName: string[];
  planID: string;
}

export interface UserLocationInfo {
  name?: string;
  lat?: number;
  lng?: number;
  time?: string;
  isArrive?: boolean;
}
