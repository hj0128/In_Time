import { UserCreateDto } from './user.dto';

export interface IUserServiceFindOneWithName {
  name: string;
}

export interface IUserServiceFindOneWithEmail {
  email: string;
}

export interface IUserServiceCreate {
  userCreateDto: UserCreateDto;
}
