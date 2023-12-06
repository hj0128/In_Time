import { FriendCreateDto, FriendRefuseDto, FriendUnFriendDto, FriendUpdateDto } from './friend.dto';
import { JwtReqUser } from '../../commons/interface/req.interface';

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

export interface IFriendServiceRefuse {
  friendRefuseDto: FriendRefuseDto;
}

export interface FriendList {
  friendID: string;
  fromUserID?: string;
  name: string;
  profileUrl: string;
  badgeUrl: string;
  status: string;
}

export interface IFriendServiceUnFriend {
  friendUnFriendDto: FriendUnFriendDto;
  userID: string;
}
