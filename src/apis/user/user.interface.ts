import { JwtReqUser } from 'src/commons/interface/req.interface';
import { UserCreateDto, UserSetRedisDto } from './user.dto';

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

export interface IUserServiceCreate {
  userCreateDto: UserCreateDto;
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
  lat?: number;
  lng?: number;
  time?: string;
  isArrive?: boolean;
}
