import { PickType } from '@nestjs/swagger';
import { FriendCreateDto, FriendDeleteDto, FriendUpdateDto } from './friend.dto';
import { User } from '../user/user.entity';
import { JwtReqUser } from '../../commons/interface/req.interface';
import { Friend } from './friend.entity';

export interface IFriendServiceFindAllUser {
  userID: string;
}

export interface IFriendServiceFindAllToUser {
  toUserID: string;
}

export interface IFriendServiceFindWithUserID {
  userID: string;
}

export interface IFriendServiceCreateFriendList {
  friendID: string;
  userID: string;
  status: string;
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

export interface FriendList {
  friendID: string;
  fromUserID?: string;
  name: string;
  profileUrl: string;
  badgeUrl: string;
  status: string;
}
