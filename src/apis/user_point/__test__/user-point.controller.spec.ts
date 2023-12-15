import { Test, TestingModule } from '@nestjs/testing';

import { JwtReqUser } from 'src/commons/interface/req.interface';
import { User_PointController } from '../user-point.controller';
import { User_PointService } from '../user-point.service';
import { USER_POINT_STATUS, User_Point } from '../user-point.entity';
import { User } from 'src/apis/user/user.entity';
import { PointFillDto, PointSendDto } from '../user-point.dto';

describe('User_PointController', () => {
  let userPointController: User_PointController;
  let userPointService: User_PointService;

  beforeEach(async () => {
    const mockUserPointService = {
      findWithUserID: jest.fn(),
      fill: jest.fn(),
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [User_PointController],
      providers: [
        { provide: User_PointService, useValue: mockUserPointService }, //
      ],
    }).compile();

    userPointController = module.get<User_PointController>(User_PointController);
    userPointService = module.get<User_PointService>(User_PointService);
  });

  const mockReq: Request & JwtReqUser = {
    user: {
      id: 'User01',
      name: '철수',
      email: 'a@a.com',
      password: '1234',
      profileUrl: 'http://a.jpg',
    },
  } as Request & JwtReqUser;
  const mockUser: User = {
    id: 'User01',
    name: '철수',
    email: 'a@a.com',
    password: '1234',
    point: 0,
    profileUrl: 'https://a.jpg',
    badgeUrl: 'https://b.jpg',
    deletedAt: null,
    userPoints: [],
    partyUsers: [],
    friends: [],
  };
  const mockUserPoint: User_Point = {
    id: 'UserPoint01',
    impUid: 'imp_01',
    amount: 0,
    status: USER_POINT_STATUS.POINT_FILL,
    createdAt: new Date(),
    deletedAt: null,
    user: mockUser,
  };

  describe('userPointFindWithUserID', () => {
    it('해당하는 userID의 point 내역을 찾는다.', async () => {
      const inputReq: Request & JwtReqUser = mockReq;

      const expectedFindWithUserID: User_Point[] = [];

      jest.spyOn(userPointService, 'findWithUserID').mockResolvedValueOnce(expectedFindWithUserID);

      const result: User_Point[] = await userPointController.userPointFindWithUserID(inputReq);

      expect(result).toEqual(expectedFindWithUserID);
      expect(userPointService.findWithUserID).toHaveBeenCalledWith({
        userID: inputReq.user.id,
      });
    });
  });

  describe('userPointFill', () => {
    it('user의 포인트를 충전한다.', async () => {
      const inputReq: Request & JwtReqUser = mockReq;
      const inputPointFillDto: PointFillDto = { impUid: 'imp_01', amount: 1000 };

      const expectedUserSend: User_Point = mockUserPoint;

      jest.spyOn(userPointService, 'fill').mockResolvedValueOnce(expectedUserSend);

      const result: User_Point = await userPointController.userPointFill(
        inputReq,
        inputPointFillDto,
      );

      expect(result).toEqual(expectedUserSend);
      expect(userPointService.fill).toHaveBeenCalledWith({
        user: inputReq.user,
        pointFillDto: inputPointFillDto,
      });
    });
  });

  describe('userPointSend', () => {
    it('user의 포인트를 보낸다.', async () => {
      const inputReq: Request & JwtReqUser = mockReq;
      const inputPointSendDto: PointSendDto = { amount: 1000 };

      const expectedSend: User_Point = mockUserPoint;

      jest.spyOn(userPointService, 'send').mockResolvedValueOnce(expectedSend);

      const result: User_Point = await userPointController.userPointSend(
        inputReq,
        inputPointSendDto,
      );

      expect(result).toEqual(expectedSend);
      expect(userPointService.send).toHaveBeenCalledWith({
        user: inputReq.user,
        pointSendDto: inputPointSendDto,
      });
    });
  });
});
