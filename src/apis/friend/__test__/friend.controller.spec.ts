import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { JwtReqUser } from '../../../commons/interface/req.interface';
import { FriendController } from '../friend.controller';
import { FriendService } from '../friend.service';
import { Friend, STATUS_ENUM } from '../friend.entity';
import { FriendListInfo } from '../friend.interface';
import { FriendCreateDto, FriendDeleteDto, FriendUpdateDto } from '../friend.dto';

describe('FriendController', () => {
  let friendController: FriendController;
  let friendService: FriendService;

  beforeEach(async () => {
    const mockFriendService = {
      findWithUserID: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendController],
      providers: [
        {
          provide: FriendService,
          useValue: mockFriendService,
        },
      ],
    }).compile();

    friendController = module.get<FriendController>(FriendController);
    friendService = module.get<FriendService>(FriendService);
  });

  const mockReq: Request & JwtReqUser = { user: { id: 'User01' } } as Request & JwtReqUser;

  const mockUser = {
    id: 'User01',
    name: '철수',
    email: 'a@a.com',
    password: '1234',
    profileUrl: 'https://a.jpg',
    badgeUrl: 'https://b.jpg',
    partyUsers: [],
    friends: [],
  };

  const mockFriend: Friend = {
    id: 'Friend01',
    toUserID: 'User02',
    isAccepted: STATUS_ENUM.SENT,
    user: mockUser,
  };

  describe('findWithUserID', () => {
    it('로그인 유저의 모든 friend를 배열로 가져온다.', async () => {
      const inputReq: Request & JwtReqUser = mockReq;

      const expectedFindWithUserID: FriendListInfo[] = [];

      jest.spyOn(friendService, 'findWithUserID').mockResolvedValueOnce(expectedFindWithUserID);

      const result: FriendListInfo[] = await friendController.friendFindWithUserID(inputReq);

      expect(result).toEqual(expectedFindWithUserID);
      expect(friendService.findWithUserID).toHaveBeenCalledWith({ userID: inputReq.user.id });
    });
  });

  describe('friendCreate', () => {
    it('friend가 성공적으로 생성되면 생성된 friend를 반환한다.', async () => {
      const inputFriendCreateDto: FriendCreateDto = { toUserName: 'User02' };
      const inputReq: Request & JwtReqUser = mockReq;

      const expectedCreate: Friend = mockFriend;

      jest.spyOn(friendService, 'create').mockResolvedValueOnce(expectedCreate);

      const result: Friend = await friendController.friendCreate(inputFriendCreateDto, inputReq);

      expect(result).toEqual(expectedCreate);
      expect(friendService.create).toHaveBeenCalledWith({
        friendCreateDto: inputFriendCreateDto,
        user: inputReq.user,
      });
    });
  });

  describe('friendUpdate', () => {
    it('친구 요청 수락 시, 친구 관계가 "SENT"에서 "FRIENDSHIP"으로 변경된다.', async () => {
      const inputFriendUpdateDto: FriendUpdateDto = { friendID: 'Friend01', fromUserID: 'User01' };
      const inputReq: Request & JwtReqUser = mockReq;

      const expectedUpdate: Friend = mockFriend;
      expectedUpdate.isAccepted = STATUS_ENUM.FRIENDSHIP;

      jest.spyOn(friendService, 'update').mockResolvedValueOnce(expectedUpdate);

      const result: Friend = await friendController.friendUpdate(inputFriendUpdateDto, inputReq);

      expect(result).toEqual(expectedUpdate);
      expect(friendService.update).toHaveBeenCalledWith({
        friendUpdateDto: inputFriendUpdateDto,
        user: inputReq.user,
      });
    });
  });

  describe('friendDelete', () => {
    it('친구 요청 거절 시, 요청 컬럼이 삭제되었으면 true를 반환한다.', async () => {
      const inputFriendDeleteDto: FriendDeleteDto = { friendID: 'User01' };

      const expectedDelete: boolean = true;

      jest.spyOn(friendService, 'delete').mockResolvedValueOnce(expectedDelete);

      const result: boolean = await friendController.friendDelete(inputFriendDeleteDto);

      expect(result).toEqual(expectedDelete);
      expect(friendService.delete).toHaveBeenCalledWith({ friendDeleteDto: inputFriendDeleteDto });
    });
  });
});
