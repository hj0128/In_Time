import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Friend, STATUS_ENUM } from './friend.entity';
import { Repository } from 'typeorm';
import {
  FriendListInfo,
  IFriendServiceCreate,
  IFriendServiceCreateFriendList,
  IFriendServiceDelete,
  IFriendServiceFindAllToUser,
  IFriendServiceFindAllUser,
  IFriendServiceFindAllUserAndToUser,
  IFriendServiceFindWithUserID,
  IFriendServiceUpdate,
  IFriendServiceUpdateIsAccepted,
} from './friend.interface';
import { UserService } from '../user/user.service';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,

    private readonly userService: UserService, //
  ) {}

  findAllUser({ userID }: IFriendServiceFindAllUser): Promise<Friend[]> {
    return this.friendRepository.find({
      where: { user: { id: userID } },
    });
  }

  findAllToUser({ toUserID }: IFriendServiceFindAllToUser): Promise<Friend[]> {
    return this.friendRepository.find({
      where: { toUserID },
      relations: ['user'],
    });
  }

  async findWithUserID({ userID }: IFriendServiceFindWithUserID): Promise<FriendListInfo[]> {
    const friendUsers = await this.findAllUser({ userID });
    const friendToUsers = await this.findAllToUser({ toUserID: userID });

    let friendList = [];
    if (friendUsers) this.createFriendList({ friends: friendUsers, friendList });
    if (friendToUsers)
      this.createFriendList({
        friends: friendToUsers,
        friendList,
        mapFn: (el) => ({
          id: el.id,
          fromUserID: el.user.id,
          name: el.user.name,
          profileUrl: el.user.profileUrl,
          badgeUrl: el.user.badgeUrl,
          status: el.isAccepted === 'SENT' ? 'received' : 'friendship',
        }),
      });

    return friendList;
  }

  async createFriendList({
    friends,
    friendList,
    mapFn,
  }: IFriendServiceCreateFriendList): Promise<void> {
    const filteredFriends = friends.filter((el) => el.isAccepted === 'SENT');

    await Promise.all(
      filteredFriends.map(async (el) => {
        const toUser = await this.userService.findOneWithUserId({ id: el.toUserID });
        if (!toUser) return;
        friendList.push(
          mapFn
            ? mapFn(el)
            : {
                name: toUser.name,
                profileUrl: toUser.profileUrl,
                badgeUrl: toUser.badgeUrl,
                status: 'sent',
              },
        );
      }),
    );
  }

  async create({ friendCreateDto, user }: IFriendServiceCreate): Promise<Friend> {
    const { toUserName } = friendCreateDto;

    const toUser = await this.userService.findOneWithName({ name: toUserName });
    if (!toUser) throw new NotFoundException('존재하지 않는 회원입니다.');
    if (toUser.id === user.id)
      throw new BadRequestException('자신에게 친구 요청을 보낼 수 없습니다.');

    const result = await this.findAllUserAndToUser({ userID: user.id, toUserID: toUser.id });
    if (result.length === 1) {
      if (result[0].toUserID === toUser.id) {
        throw new ConflictException('이미 요청한 친구입니다. 수락을 기다려 주세요.');
      } else {
        throw new ConflictException('이미 요청을 받았습니다. 수락해 주세요.');
      }
    } else if (result.length === 2) {
      throw new ConflictException('이미 친구 입니다.');
    } else {
      const create = await this.friendRepository.save({
        toUserID: toUser.id,
        isAccept: STATUS_ENUM.SENT,
        user: { id: user.id },
      });
      if (!create) throw new InternalServerErrorException('친구 요청에 실패하였습니다.');

      return create;
    }
  }

  findAllUserAndToUser({
    userID,
    toUserID,
  }: IFriendServiceFindAllUserAndToUser): Promise<Friend[]> {
    return this.friendRepository.find({
      where: [
        { toUserID: toUserID, user: { id: userID } },
        { toUserID: userID, user: { id: toUserID } },
      ],
    });
  }

  async updateIsAccepted({ friendID }: IFriendServiceUpdateIsAccepted): Promise<void> {
    const update = await this.friendRepository.update(
      { id: friendID },
      { isAccepted: STATUS_ENUM.FRIENDSHIP },
    );
    if (update.affected === 0) throw new InternalServerErrorException('업데이트에 실패하였습니다.');
  }

  async update({ friendUpdateDto, user }: IFriendServiceUpdate): Promise<Friend> {
    const { friendID, fromUserID } = friendUpdateDto;

    const create = await this.friendRepository.save({
      toUserID: fromUserID,
      isAccept: STATUS_ENUM.FRIENDSHIP,
      user: { id: user.id },
    });
    if (!create) throw new InternalServerErrorException('친구 생성에 실패하였습니다.');

    await this.updateIsAccepted({ friendID });
    await this.updateIsAccepted({ friendID: create.id });

    return create;
  }

  async delete({ friendDeleteDto }: IFriendServiceDelete): Promise<boolean> {
    const { friendID } = friendDeleteDto;

    const result = await this.friendRepository.delete({ id: friendID });
    if (!result) throw new InternalServerErrorException('삭제에 실패하였습니다.');

    return result.affected ? true : false;
  }
}
