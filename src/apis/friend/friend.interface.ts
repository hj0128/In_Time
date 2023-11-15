import { PickType } from '@nestjs/swagger';
import { JwtReqUser } from '../auth/auth.interface';
import { FriendCreateDto, FriendDeleteDto, FriendUpdateDto } from './friend.dto';
import { User } from '../user/user.entity';

export interface IFriendServiceFindAllUser {
  userID: string;
}

export interface IFriendServiceFindAllToUser {
  toUserID: string;
}

export interface IFriendServiceFindWithUserID {
  userID: string;
}

export interface IFriendServiceFindAllUserAndToUser {
  userID: string;
  toUserID: string;
}

export interface IFriendServiceCreate {
  friendCreateDto: FriendCreateDto;
  user: JwtReqUser['user'];
}

export interface IFriendServiceUpdateIsAccepted {
  friendID: string;
}

export interface IFriendServiceUpdate {
  friendUpdateDto: FriendUpdateDto;
  user: JwtReqUser['user'];
}

export interface IFriendServiceDelete {
  friendDeleteDto: FriendDeleteDto;
}

export class FriendListInfo extends PickType(User, ['name', 'profileUrl', 'badgeUrl']) {
  status: string;
  friendID?: string;
  fromUserID?: string;
}
