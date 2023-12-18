import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendService } from '../friend.service';
import { UserService } from '../../user/user.service';
import { Friend, STATUS_ENUM } from '../friend.entity';
import { User } from '../../user/user.entity';
import { JwtReqUser } from 'src/commons/interface/req.interface';
import { FriendList } from '../friend.interface';
import {
  FriendCreateDto,
  FriendRefuseDto,
  FriendUnFriendDto,
  FriendUpdateDto,
} from '../friend.dto';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('FriendService', () => {
  let friendService: FriendService;
  let userService: UserService;
  let mockFriendRepository: Partial<Record<keyof Repository<Friend>, jest.Mock>>;

  beforeEach(async () => {
    mockFriendRepository = {
      find: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockUserService = { findOneWithUserID: jest.fn(), findOneWithName: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendService,
        { provide: getRepositoryToken(Friend), useValue: mockFriendRepository },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    friendService = module.get<FriendService>(FriendService);
    userService = module.get<UserService>(UserService);
  });

  const mockJwtReqUser: JwtReqUser['user'] = {
    id: 'User01',
    name: '철수',
    email: 'a@a.com',
    password: '1234',
    profileUrl: 'http://a.jpg',
  };
  const mockUser: User = {
    id: 'User01',
    name: '철수',
    email: 'a@a.com',
    password: '1234',
    point: 0,
    profileUrl: 'http://a.jpg',
    badgeUrl: 'http://b.jpg',
    deletedAt: null,
    partyUsers: [],
    friends: [],
    userPoints: [],
    userLocations: [],
  };
  const mockFriend: Friend = {
    id: 'Friend01',
    toUserID: 'User01',
    isAccepted: STATUS_ENUM.FRIENDSHIP,
    deletedAt: null,
    user: mockUser,
  };
  const mockFriendList: FriendList = {
    friendID: 'Friend01',
    fromUserID: 'User01',
    name: '철수',
    profileUrl: 'http://a.jpg',
    badgeUrl: 'http://b.jpg',
    status: 'friendship',
  };

  describe('findAllUser', () => {
    it('userID에 해당하는 모든 friend를 반환한다.', async () => {
      const inputUserID: string = mockUser.id;

      const expectedFind: Friend[] = [];

      jest.spyOn(mockFriendRepository, 'find').mockResolvedValue(expectedFind);

      const result: Friend[] = await friendService.findAllUser({ userID: inputUserID });

      expect(result).toEqual(expectedFind);
      expect(mockFriendRepository.find).toHaveBeenCalledWith({
        where: { user: { id: inputUserID } },
        relations: ['user'],
      });
    });
  });

  describe('findAllToUser', () => {
    it('toUserID에 해당하는 모든 friend를 반환한다.', async () => {
      const inputToUserID: string = mockUser.id;

      const expectedFind: Friend[] = [];

      jest.spyOn(mockFriendRepository, 'find').mockResolvedValue(expectedFind);

      const result: Friend[] = await friendService.findAllToUser({ toUserID: inputToUserID });

      expect(result).toEqual(expectedFind);
      expect(mockFriendRepository.find).toHaveBeenCalledWith({
        where: { toUserID: inputToUserID },
        relations: ['user'],
      });
    });
  });

  describe('findWithUserID', () => {
    it('userID에 대한 친구 목록을 반환한다.', async () => {
      const inputUserID: string = mockUser.id;

      const expectedFriend: Friend[] = [];
      const expectedFriendList: FriendList = mockFriendList;
      const expectedFriendListArray: FriendList[] = [];

      jest.spyOn(friendService, 'findAllUser').mockResolvedValue(expectedFriend);
      jest.spyOn(friendService, 'findAllToUser').mockResolvedValue(expectedFriend);
      jest.spyOn(friendService, 'createFriendList').mockResolvedValue(expectedFriendList);

      const result: FriendList[] = await friendService.findWithUserID({ userID: inputUserID });

      expect(result).toEqual(expectedFriendListArray);
      expect(friendService.findAllUser).toHaveBeenCalledWith({ userID: inputUserID });
      expect(friendService.findAllToUser).toHaveBeenCalledWith({ toUserID: inputUserID });
    });
  });

  describe('createFriendList', () => {
    it('friendList를 생성하면 예상 항목을 추가한다.', async () => {
      const inputFriendID: string = mockFriend.id;
      const inputUserID: string = mockUser.id;
      const inputStatus: string = mockFriendList.status;

      const expectedFriendList: FriendList = mockFriendList;
      const expectedFindOneWithUserId: User = mockUser;

      jest.spyOn(userService, 'findOneWithUserID').mockResolvedValue(expectedFindOneWithUserId);

      const result: FriendList = await friendService.createFriendList({
        friendID: inputFriendID,
        userID: inputUserID,
        status: inputStatus,
      });

      expect(result).toEqual(expectedFriendList);
      expect(userService.findOneWithUserID).toHaveBeenCalledWith({ id: inputUserID });
    });
  });

  describe('create', () => {
    const inputFriendCreateDto: FriendCreateDto = { toUserName: '유리' };
    const inputUser: JwtReqUser['user'] = mockJwtReqUser;

    it('toUserName에 해당하는 user를 찾지 못한다면, 존재하지 않는 회원이므로 NotFoundException을 발생시킨다.', async () => {
      jest.spyOn(userService, 'findOneWithName').mockResolvedValue(undefined);

      try {
        await friendService.create({ friendCreateDto: inputFriendCreateDto, user: inputUser });
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }

      expect(userService.findOneWithName).toHaveBeenCalledWith({
        name: inputFriendCreateDto.toUserName,
      });
    });

    it('자기 자신에게 친구 요청을 보내면 BadRequestException을 발생시킨다.', async () => {
      const expectedFindOneWithName: User = mockUser;

      jest.spyOn(userService, 'findOneWithName').mockResolvedValue(expectedFindOneWithName);

      try {
        await friendService.create({ friendCreateDto: inputFriendCreateDto, user: inputUser });
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('이미 친구 요청을 보낸 경우 ConflictException을 발생시킨다.', async () => {
      const expectedFindAllUserAndToUser: Friend[] = [mockFriend];
      const expectedFindOneWithName: User = mockUser;
      expectedFindOneWithName.id = 'User02';
      expectedFindOneWithName.name = '유리';

      jest.spyOn(userService, 'findOneWithName').mockResolvedValue(expectedFindOneWithName);
      jest
        .spyOn(friendService, 'findAllUserAndToUser')
        .mockResolvedValue(expectedFindAllUserAndToUser);

      try {
        await friendService.create({ friendCreateDto: inputFriendCreateDto, user: inputUser });
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
      }
    });

    it('이미 요청을 받은 경우 ConflictException을 발생시킨다.', async () => {
      const expectedFindAllUserAndToUser: Friend[] = [
        {
          id: 'Friend01',
          toUserID: 'User01',
          isAccepted: STATUS_ENUM.SENT,
          user: mockUser,
          deletedAt: null,
        },
      ];
      const expectedFindOneWithName: User = mockUser;
      expectedFindOneWithName.id = 'User02';
      expectedFindOneWithName.name = '유리';

      jest.spyOn(userService, 'findOneWithName').mockResolvedValue(expectedFindOneWithName);
      jest
        .spyOn(friendService, 'findAllUserAndToUser')
        .mockResolvedValue(expectedFindAllUserAndToUser);

      try {
        await friendService.create({ friendCreateDto: inputFriendCreateDto, user: inputUser });
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
      }
    });

    it('이미 친구인 경우 ConflictException을 발생시킨다.', async () => {
      const expectedFindAllUserAndToUser: Friend[] = [mockFriend, mockFriend];
      const expectedFindOneWithName: User = mockUser;
      expectedFindOneWithName.id = 'User02';
      expectedFindOneWithName.name = '유리';

      jest.spyOn(userService, 'findOneWithName').mockResolvedValue(expectedFindOneWithName);
      jest
        .spyOn(friendService, 'findAllUserAndToUser')
        .mockResolvedValue(expectedFindAllUserAndToUser);

      try {
        await friendService.create({ friendCreateDto: inputFriendCreateDto, user: inputUser });
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
      }
    });

    it('친구 요청을 생성하고 생성된 friend를 반환한다.', async () => {
      const expectedFindAllUserAndToUser: Friend[] = [];
      const expectedFindOneWithName: User = mockUser;
      expectedFindOneWithName.id = 'User02';
      expectedFindOneWithName.name = '유리';
      const expectedSave: Friend = mockFriend;

      jest.spyOn(userService, 'findOneWithName').mockResolvedValue(expectedFindOneWithName);
      jest
        .spyOn(friendService, 'findAllUserAndToUser')
        .mockResolvedValue(expectedFindAllUserAndToUser);
      jest.spyOn(mockFriendRepository, 'save').mockResolvedValue(expectedSave);

      const result = await friendService.create({
        friendCreateDto: inputFriendCreateDto,
        user: inputUser,
      });

      expect(result).toEqual(expectedSave);
      expect(userService.findOneWithName).toHaveBeenCalledWith({
        name: inputFriendCreateDto.toUserName,
      });
      expect(friendService.findAllUserAndToUser).toHaveBeenCalledWith({
        userID: inputUser.id,
        toUserID: expectedFindOneWithName.id,
      });
    });
  });

  describe('findAllUserAndToUser', () => {
    it('userID와 toUserID의 친구 관계를 모두 반환한다.', async () => {
      const inputUserID: string = 'User01';
      const inputToUserID: string = 'User02';

      const expectedFind: Friend[] = [mockFriend];

      jest.spyOn(mockFriendRepository, 'find').mockResolvedValue(expectedFind);

      const result: Friend[] = await friendService.findAllUserAndToUser({
        userID: inputUserID,
        toUserID: inputToUserID,
      });

      expect(result).toEqual(expectedFind);
      expect(mockFriendRepository.find).toHaveBeenCalledWith({
        where: [
          { toUserID: inputToUserID, user: { id: inputUserID } },
          { toUserID: inputUserID, user: { id: inputToUserID } },
        ],
      });
    });
  });

  describe('updateIsAccepted', () => {
    const inputFriendID: string = 'Friend01';

    it('friendID의 friendship을 변경한다.', async () => {
      const expectedUpdate = { affected: 1 };

      jest.spyOn(mockFriendRepository, 'update').mockResolvedValue(expectedUpdate);

      const result: void = await friendService.updateIsAccepted({ friendID: inputFriendID });

      expect(result).toBeUndefined();
      expect(mockFriendRepository.update).toHaveBeenCalledWith(
        { id: inputFriendID },
        { isAccepted: STATUS_ENUM.FRIENDSHIP },
      );
    });

    it('변경에 실패하면 InternalServerErrorException을 발생시킨다.', async () => {
      const expectedUpdate = { affected: 0 };

      jest.spyOn(mockFriendRepository, 'update').mockResolvedValueOnce(expectedUpdate);

      try {
        await friendService.updateIsAccepted({ friendID: inputFriendID });
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('update', () => {
    it('친구 관계를 업데이트하고 업데이트된 friend를 반환한다.', async () => {
      const inputFriendUpdateDto: FriendUpdateDto = { friendID: 'Friend01', fromUserID: 'User01' };
      const inputUser: JwtReqUser['user'] = mockJwtReqUser;

      const expectedSave: Friend = mockFriend;
      expectedSave.isAccepted = STATUS_ENUM.FRIENDSHIP;

      jest.spyOn(mockFriendRepository, 'save').mockResolvedValue(expectedSave);
      jest.spyOn(friendService, 'updateIsAccepted').mockResolvedValue();

      const result: Friend = await friendService.update({
        friendUpdateDto: inputFriendUpdateDto,
        user: inputUser,
      });

      expect(result).toEqual(expectedSave);
      expect(mockFriendRepository.save).toHaveBeenCalledWith({
        toUserID: inputFriendUpdateDto.fromUserID,
        isAccepted: STATUS_ENUM.FRIENDSHIP,
        user: { id: inputUser.id },
      });
      expect(friendService.updateIsAccepted).toHaveBeenCalledWith({
        friendID: inputFriendUpdateDto.friendID,
      });
      expect(friendService.updateIsAccepted).toHaveBeenCalledWith({ friendID: expectedSave.id });
    });
  });

  describe('refuse', () => {
    const inputFriendRefuseDto: FriendRefuseDto = { friendID: 'Friend01' };

    it('친구 요청을 삭제하고 삭제 여부를 반환한다.', async () => {
      jest.spyOn(mockFriendRepository, 'delete').mockResolvedValue({ affected: 1 });

      const result: boolean = await friendService.refuse({
        friendRefuseDto: inputFriendRefuseDto,
      });

      expect(result).toEqual(true);
      expect(mockFriendRepository.delete).toHaveBeenCalledWith({
        id: inputFriendRefuseDto.friendID,
      });
    });

    it('친구 요청 삭제에 실패하면 InternalServerErrorException을 발생시킨다.', async () => {
      jest.spyOn(mockFriendRepository, 'delete').mockResolvedValue({ affected: 0 });

      try {
        await friendService.refuse({ friendRefuseDto: inputFriendRefuseDto });
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('unFriend', () => {
    const inputFriendUnFriendDto: FriendUnFriendDto = { fromUserID: 'User01' };
    const inputUserID: string = mockUser.id;

    it('친구 관계를 삭제하고 삭제 여부를 반환한다.', async () => {
      const expectedFriend: Friend[] = [];

      jest.spyOn(friendService, 'findAllUserAndToUser').mockResolvedValue(expectedFriend);
      jest.spyOn(mockFriendRepository, 'delete').mockResolvedValue({ affected: 1 });

      const result: boolean = await friendService.unFriend({
        friendUnFriendDto: inputFriendUnFriendDto,
        userID: inputUserID,
      });

      expect(result).toBe(true);
      expect(friendService.findAllUserAndToUser).toHaveBeenCalledWith({
        userID: inputUserID,
        toUserID: inputFriendUnFriendDto.fromUserID,
      });
    });

    it('친구 관계 삭제에 실패하면 InternalServerErrorException을 발생시킨다.', async () => {
      jest.spyOn(mockFriendRepository, 'delete').mockResolvedValue({ affected: 0 });

      try {
        await friendService.unFriend({
          friendUnFriendDto: inputFriendUnFriendDto,
          userID: inputUserID,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});
