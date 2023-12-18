import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, In, Repository, UpdateResult } from 'typeorm';
import { JwtReqUser } from '../../../commons/interface/req.interface';
import { PlanService } from '../plan.service';
import { Party_UserService } from '../../party-user/party-user.service';
import { Plan } from '../plan.entity';
import { User } from '../../user/user.entity';
import { Party } from '../../party/party.entity';
import { User_PointService } from '../../user-point/user-point.service';
import { Party_User } from '../../party-user/party-user.entity';
import { PlanCreateDto, PlanSoftDeleteDto } from '../plan.dto';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

describe('PlanService', () => {
  let planService: PlanService;
  let partyUserService: Party_UserService;
  let userPointService: User_PointService;
  let mockPlanRepository: Partial<Record<keyof Repository<Plan>, jest.Mock>>;

  const manager = {
    save: jest.fn(),
    increment: jest.fn(),
    softDelete: jest.fn(),
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
    mockPlanRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn(),
    };

    const mockDataSource = { createQueryRunner: jest.fn().mockReturnValue(queryRunner) };
    const mockPartyUserService = { findAllWithUserID: jest.fn(), findAllWithPartyID: jest.fn() };
    const mockUserPointService = { checkPoint: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanService,
        { provide: getRepositoryToken(Plan), useValue: mockPlanRepository },
        { provide: DataSource, useValue: mockDataSource },
        { provide: Party_UserService, useValue: mockPartyUserService },
        { provide: User_PointService, useValue: mockUserPointService },
      ],
    }).compile();

    planService = module.get<PlanService>(PlanService);
    partyUserService = module.get<Party_UserService>(Party_UserService);
    userPointService = module.get<User_PointService>(User_PointService);
  });

  const mockJwtReqUser: JwtReqUser['user'] = {
    id: 'User01',
    name: '철수',
    email: 'a@a.com',
    password: '1234',
    profileUrl: 'http://a.jpg',
  };
  const mockParty: Party = {
    id: 'Party01',
    name: '파티명',
    point: 0,
    deletedAt: null,
    chats: [],
    markers: [],
    partyPoints: [],
    partyUsers: [],
    plans: [],
  };
  const mockPlan: Plan = {
    id: 'Plan01',
    planName: '플랜명',
    placeName: '미진삼겹살',
    placeAddress: '대구 달서구 월성동 1195-1',
    placeLat: 35.8668,
    placeLng: 128.6015,
    date: '2023-11-11T19:30',
    fine: 5000,
    isEnd: false,
    deletedAt: null,
    party: mockParty,
  };
  const mockUser: User = {
    id: 'User01',
    name: '철수',
    email: 'a@a.com',
    password: '1234',
    point: 0,
    profileUrl: 'https://a.jpg',
    badgeUrl: 'https://b.jpg',
    deletedAt: null,
    partyUsers: [],
    friends: [],
    userPoints: [],
    userLocations: [],
  };
  const mockPartyUser: Party_User = {
    id: 'PartyUser01',
    deletedAt: null,
    party: mockParty,
    user: mockUser,
  };

  describe('findOneWithPlanID', () => {
    it('planID에 해당하는 plan을 반환한다.', async () => {
      const inputPlanID: string = 'Plan01';

      const expectedFindOne: Plan = mockPlan;

      jest.spyOn(mockPlanRepository, 'findOne').mockResolvedValue(expectedFindOne);

      const result: Plan = await planService.findOneWithPlanID({ planID: inputPlanID });

      expect(result).toEqual(expectedFindOne);
      expect(mockPlanRepository.findOne).toHaveBeenCalledWith({
        where: { id: inputPlanID },
        relations: ['party'],
      });
    });
  });

  describe('findWithPartyID', () => {
    it('partyID에 해당하는 모든 plan을 반환한다.', async () => {
      const inputPartyID: string = 'Party01';

      const expectedFind: Plan[] = [mockPlan];

      jest.spyOn(mockPlanRepository, 'find').mockResolvedValue(expectedFind);

      const result: Plan[] = await planService.findWithPartyID({ partyID: inputPartyID });

      expect(result).toEqual(expectedFind);
      expect(mockPlanRepository.find).toHaveBeenCalledWith({
        where: { party: { id: inputPartyID } },
      });
    });
  });

  describe('findWithUserIDAndPartyID', () => {
    const inputUser: JwtReqUser['user'] = mockJwtReqUser;

    it('로그인 user의 모든 partyUser를 반환한다.', async () => {
      const expectedFindAllWithUserID: Party_User[] = [mockPartyUser];

      jest
        .spyOn(partyUserService, 'findAllWithUserID')
        .mockResolvedValue(expectedFindAllWithUserID);

      await planService.findWithUserIDAndPartyID({ user: inputUser });

      expect(partyUserService.findAllWithUserID).toHaveBeenCalledWith({ userID: inputUser.id });
    });

    it('로그인 user의 모든 plan을 반환한다.', async () => {
      const inputFind: string[] = ['Party01'];

      const expectedFind: Plan[] = [mockPlan];
      const expectedFindAllWithUserID: Party_User[] = [mockPartyUser];

      jest
        .spyOn(partyUserService, 'findAllWithUserID')
        .mockResolvedValue(expectedFindAllWithUserID);

      jest.spyOn(mockPlanRepository, 'find').mockResolvedValue(expectedFind);

      const result: Plan[] = await planService.findWithUserIDAndPartyID({ user: inputUser });

      expect(result).toEqual(expectedFind);
      expect(mockPlanRepository.find).toHaveBeenCalledWith({
        where: { party: { id: In(inputFind) } },
      });
    });
  });

  describe('create', () => {
    it('plan을 생성한 후 생성된 plan을 반환한다.', async () => {
      const inputPlanCreateDto: PlanCreateDto = {
        planName: '플랜명',
        placeName: '장소',
        placeAddress: '주소',
        placeLat: 12.203,
        placeLng: 15.205,
        date: '2023-11-30',
        fine: 5000,
        partyID: 'Party01',
      };

      const expectedPartyUser: Party_User[] = [mockPartyUser];
      const expectedSave: Plan = mockPlan;

      jest.spyOn(partyUserService, 'findAllWithPartyID').mockResolvedValue(expectedPartyUser);
      jest.spyOn(userPointService, 'checkPoint').mockResolvedValue(undefined);
      jest.spyOn(mockPlanRepository, 'save').mockResolvedValue(expectedSave);

      const result = await planService.create({ planCreateDto: inputPlanCreateDto });

      expect(result).toEqual(expectedSave);
      expect(mockPlanRepository.save).toHaveBeenCalledWith({
        planName: inputPlanCreateDto.planName,
        placeName: inputPlanCreateDto.placeName,
        placeAddress: inputPlanCreateDto.placeAddress,
        placeLat: inputPlanCreateDto.placeLat,
        placeLng: inputPlanCreateDto.placeLng,
        date: inputPlanCreateDto.date,
        fine: inputPlanCreateDto.fine,
        party: {
          id: inputPlanCreateDto.partyID,
        },
      });
    });
  });

  describe('checkEnd', () => {
    it('약속시간이 종료되면 에러를 반환한다.', async () => {
      const inputPlanID: string = 'Plan01';

      const expectedPlan: Plan = mockPlan;
      expectedPlan.isEnd = true;

      jest.spyOn(planService, 'findOneWithPlanID').mockResolvedValue(expectedPlan);
      try {
        await planService.checkEnd({
          planID: inputPlanID,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('softDelete', () => {
    const inputPlanSoftDeleteDto: PlanSoftDeleteDto = { planID: 'Plan01' };
    it('plan을 소프트 삭제한다.', async () => {
      const expectedSoftDelete: UpdateResult = { generatedMaps: [], affected: 1, raw: [] };

      jest.spyOn(manager, 'softDelete').mockResolvedValue(expectedSoftDelete);

      const result: boolean = await planService.softDelete({
        planSoftDeleteDto: inputPlanSoftDeleteDto,
      });

      expect(result).toBe(true);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('plan 소프트 삭제에 실패하면 롤백한다.', async () => {
      jest.spyOn(manager, 'softDelete').mockImplementationOnce(() => {
        throw new InternalServerErrorException();
      });

      await expect(
        planService.softDelete({
          planSoftDeleteDto: inputPlanSoftDeleteDto,
        }),
      ).rejects.toThrow(InternalServerErrorException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
