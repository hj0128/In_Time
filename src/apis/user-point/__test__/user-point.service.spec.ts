import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User_PointService } from '../user-point.service';
import { USER_POINT_STATUS, User_Point } from '../user-point.entity';
import { DataSource, InsertResult, Repository, UpdateResult } from 'typeorm';
import { IamPortService } from '../../iam-port/iam-port.service';
import { UserService } from '../../user/user.service';
import { User } from '../../user/user.entity';
import { JwtReqUser } from 'src/commons/interface/req.interface';
import { PointFillDto, PointSendDto } from '../user-point.dto';
import { InternalServerErrorException, UnprocessableEntityException } from '@nestjs/common';

describe('User_PointService', () => {
  let userPointService: User_PointService;
  let mockUserPointRepository: Partial<Record<keyof Repository<User_Point>, jest.Mock>>;
  let userService: UserService;
  let iamPortService: IamPortService;

  const manager = {
    save: jest.fn(),
    findOne: jest.fn(),
    increment: jest.fn(),
  };

  const queryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: manager,
  };

  beforeEach(async () => {
    mockUserPointRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const mockDataSource = { createQueryRunner: jest.fn().mockReturnValue(queryRunner) };
    const mockUserService = { findOneWithUserID: jest.fn() };
    const mockIamPortService = { checkPaid: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        User_PointService,
        { provide: getRepositoryToken(User_Point), useValue: mockUserPointRepository },
        { provide: DataSource, useValue: mockDataSource },
        { provide: UserService, useValue: mockUserService },
        { provide: IamPortService, useValue: mockIamPortService },
      ],
    }).compile();

    userPointService = module.get<User_PointService>(User_PointService);
    userService = module.get<UserService>(UserService);
    iamPortService = module.get<IamPortService>(IamPortService);
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
    point: 500,
    profileUrl: 'https://a.jpg',
    badgeUrl: 'https://b.jpg',
    deletedAt: null,
    partyUsers: [],
    friends: [],
    userPoints: [],
    userLocations: [],
  };
  const mockUserPoint: User_Point = {
    id: 'UserPoint01',
    impUid: 'imp_01',
    amount: 0,
    status: USER_POINT_STATUS.FINE_SEND,
    createdAt: new Date(),
    deletedAt: null,
    user: mockUser,
  };

  describe('findWithUserID', () => {
    it('partyID와 일치하는 모든 유저 포인트를 반환한다.', async () => {
      const inputUserID: string = 'User01';

      const expectedUserPoint: User_Point[] = [];

      jest.spyOn(mockUserPointRepository, 'find').mockResolvedValue(expectedUserPoint);

      const result: User_Point[] = await userPointService.findWithUserID({
        userID: inputUserID,
      });

      expect(result).toEqual(expectedUserPoint);
      expect(mockUserPointRepository.find).toHaveBeenCalledWith({
        where: { user: { id: inputUserID } },
      });
    });
  });

  describe('findOneWithImpUid', () => {
    it('impUid와 일치하는 유저 포인트를 반환한다.', async () => {
      const inputImpUid: string = 'imp_01';

      const expectedUserPoint: User_Point = mockUserPoint;

      jest.spyOn(mockUserPointRepository, 'findOne').mockResolvedValue(expectedUserPoint);

      const result: User_Point = await userPointService.findOneWithImpUid({
        impUid: inputImpUid,
      });

      expect(result).toEqual(expectedUserPoint);
      expect(mockUserPointRepository.findOne).toHaveBeenCalledWith({
        where: { impUid: inputImpUid },
      });
    });
  });

  describe('checkDuplication', () => {
    it('이미 처리된 결제인지 검증한다.', async () => {
      const inputImpUid: string = 'imp_01';

      jest.spyOn(mockUserPointRepository, 'findOne').mockResolvedValue(undefined);

      const result: void = await userPointService.checkDuplication({
        impUid: inputImpUid,
      });

      expect(result).toBeUndefined();
      expect(mockUserPointRepository.findOne).toHaveBeenCalledWith({
        where: { impUid: inputImpUid },
      });
    });
  });

  describe('fill', () => {
    const inputUser: JwtReqUser['user'] = mockJwtReqUser;
    const inputPointFillDto: PointFillDto = { impUid: 'imp_01', amount: 100 };

    it('user의 포인트를 채우고 유저 포인트를 반환한다.', async () => {
      const expectedUserPoint: User_Point = mockUserPoint;
      const expectedIncrement: InsertResult = { generatedMaps: [], identifiers: [], raw: [] };

      jest.spyOn(iamPortService, 'checkPaid').mockResolvedValue(undefined);
      jest.spyOn(userPointService, 'checkDuplication').mockResolvedValue(undefined);
      jest.spyOn(manager, 'save').mockResolvedValue(expectedUserPoint);
      jest.spyOn(manager, 'increment').mockResolvedValue(expectedIncrement);

      const result: User_Point = await userPointService.fill({
        user: inputUser,
        pointFillDto: inputPointFillDto,
      });

      expect(result).toEqual(expectedUserPoint);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('포인트 채우기에 실패하면 롤백한다.', async () => {
      jest.spyOn(manager, 'save').mockImplementationOnce(() => {
        throw new InternalServerErrorException();
      });

      await expect(
        userPointService.fill({ user: inputUser, pointFillDto: inputPointFillDto }),
      ).rejects.toThrow(InternalServerErrorException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('checkPoint', () => {
    it('포인트가 부족하면 UnprocessableEntityException 에러를 발생시킨다.', async () => {
      const inputUserID: string = 'User01';
      const inputAmount: number = 1000;

      const expectedUser: User = mockUser;

      jest.spyOn(userService, 'findOneWithUserID').mockResolvedValue(expectedUser);

      try {
        await userPointService.checkPoint({ userID: inputUserID, amount: inputAmount });
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
      }
    });
  });

  describe('send', () => {
    const inputUser: JwtReqUser['user'] = mockJwtReqUser;
    const inputPointSendDto: PointSendDto = { amount: 100 };

    it('user의 포인트를 내보내고 유저 포인트를 반환한다.', async () => {
      const expectedUserPoint: User_Point = mockUserPoint;
      const expectedIncrement: UpdateResult = { generatedMaps: [], raw: [], affected: 1 };

      jest.spyOn(userPointService, 'checkPoint').mockResolvedValue(undefined);
      jest.spyOn(manager, 'save').mockResolvedValue(expectedUserPoint);
      jest.spyOn(manager, 'increment').mockResolvedValue(expectedIncrement);

      const result: User_Point = await userPointService.send({
        user: inputUser,
        pointSendDto: inputPointSendDto,
      });

      expect(result).toEqual(expectedUserPoint);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('포인트 내보내기에 실패하면 롤백한다.', async () => {
      jest.spyOn(manager, 'save').mockImplementationOnce(() => {
        throw new InternalServerErrorException();
      });

      jest.spyOn(manager, 'increment').mockImplementationOnce(() => {
        throw new InternalServerErrorException();
      });

      await expect(
        userPointService.send({ user: inputUser, pointSendDto: inputPointSendDto }),
      ).rejects.toThrow(Error);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
