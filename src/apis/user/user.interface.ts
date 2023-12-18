import { UserCreateDto, UserDeleteDto } from './user.dto';
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
