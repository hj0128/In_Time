import { JwtReqUser } from 'src/commons/interface/req.interface';
import { UserCreateDto, UserDeleteDto, UserSetRedisDto } from './user.dto';
import { Request } from 'express';

export interface IUserServiceFindOneWithUserID {
  id: string;
}

export interface IUserServiceFindAllWithUserID {
  usersID: string[];
}

export interface IUserServiceFindOneWithName {
  name: string;
}

export interface IUserServiceFindOneWithEmail {
  email: string;
}

export interface IUserServiceSendEmail {
  name: string;
  userEmail: string;
}

export interface IUserServiceCreate {
  userCreateDto: UserCreateDto;
}

export interface IUserServiceSoftDelete {
  userID: string;
  headers: Request['headers'];
}

export interface IUserServiceDelete {
  userDeleteDto: UserDeleteDto;
}

export interface IUserServiceSetRedis {
  user: JwtReqUser['user'];
  userSetRedisDto: UserSetRedisDto;
}

export interface IUserServiceGetRedis {
  usersName: string[];
}

export interface RedisInfo {
  userName: string;
  myLat?: number;
  myLng?: number;
  time?: string;
  isArrive?: boolean;
}
