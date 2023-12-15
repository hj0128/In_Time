import { Test, TestingModule } from '@nestjs/testing';
import { PartyService } from '../party.service';
import { Party_UserService } from '../../party-user/party-user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Party } from '../party.entity';
import { JwtReqUser } from '../../../commons/interface/req.interface';
import { DataSource, InsertResult, Repository, UpdateResult } from 'typeorm';
import { PlanService } from '../../plan/plan.service';
import { User_PointService } from '../../user_point/user-point.service';
import { PartyList } from '../party.interface';
import { PartyCreateDto, PartySoftDeleteDto, PartyUpdateAndUserAndPlanDto } from '../party.dto';
import { Plan } from '../../plan/plan.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { USER_POINT_STATUS, User_Point } from '../../user_point/user-point.entity';
import { User } from '../../user/user.entity';

describe('PartyService', () => {
  let partyService: PartyService;
  let mockPartyRepository: Partial<Record<keyof Repository<Party>, jest.Mock>>;
  let partyUserService: Party_UserService;
  let planService: PlanService;
  let userPointService: User_PointService;

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
    mockPartyRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const mockPartyUserService = { findAllWithPartyID: jest.fn(), create: jest.fn() };
    const mockDataSource = { createQueryRunner: jest.fn().mockReturnValue(queryRunner) };
    const mockPlanService = { checkEnd: jest.fn() };
    const mockUserPointService = { fine: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartyService,
        { provide: getRepositoryToken(Party), useValue: mockPartyRepository },
        { provide: Party_UserService, useValue: mockPartyUserService },
        { provide: DataSource, useValue: mockDataSource },
        { provide: PlanService, useValue: mockPlanService },
        { provide: User_PointService, useValue: mockUserPointService },
      ],
    }).compile();

    partyService = module.get<PartyService>(PartyService);
    partyUserService = module.get<Party_UserService>(Party_UserService);
    planService = module.get<PlanService>(PlanService);
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

  describe('findOneWithPartyID', () => {
    it('partyID에 해당하는 party를 반환한다.', async () => {
      const inputPartyID: string = mockParty.id;

      const expectedFindOne: Party = mockParty;

      jest.spyOn(mockPartyRepository, 'findOne').mockResolvedValue(expectedFindOne);

      const result: Party = await partyService.findOneWithPartyID({ partyID: inputPartyID });

      expect(result).toEqual(expectedFindOne);
      expect(mockPartyRepository.findOne).toHaveBeenCalledWith({ where: { id: inputPartyID } });
    });
  });

  describe('findWithUserID', () => {
    it('userID에 해당하는 모든 partyList를 반환한다.', async () => {
      const inputUserID: string = mockJwtReqUser.id;

      const expectedFind: PartyList[] = [];

      jest.spyOn(mockPartyRepository, 'find').mockResolvedValue(expectedFind);

      const result: PartyList[] = await partyService.findWithUserID({ userID: inputUserID });

      expect(result).toEqual(expectedFind);
      expect(mockPartyRepository.find).toHaveBeenCalledWith({
        where: { partyUsers: { user: { id: inputUserID } } },
        relations: ['partyUsers'],
      });
    });
  });

  describe('create', () => {
    it('party를 생성하고 생성한 party를 반환한다.', async () => {
      const inputPartyCreateDto: PartyCreateDto = {
        name: '파티명',
        friendsID: '["User01", "User02"]',
      };
      const inputUser: JwtReqUser['user'] = mockJwtReqUser;

      const expectedPartySave: Party = mockParty;
      const expectedCreate: InsertResult = { generatedMaps: [], identifiers: [], raw: [] };

      jest.spyOn(manager, 'save').mockResolvedValue(expectedPartySave);
      jest.spyOn(partyUserService, 'create').mockResolvedValue(expectedCreate);

      const result: Party = await partyService.create({
        partyCreateDto: inputPartyCreateDto,
        user: inputUser,
      });

      expect(result).toEqual(expectedPartySave);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('party 생성에 실패하면 롤백한다.', async () => {
      const inputPartyCreateDto: PartyCreateDto = {
        name: '파티명',
        friendsID: '["User01", "User02"]',
      };
      const inputUser: JwtReqUser['user'] = mockJwtReqUser;

      jest.spyOn(manager, 'save').mockImplementationOnce(() => {
        throw new InternalServerErrorException();
      });

      jest.spyOn(partyUserService, 'create').mockImplementationOnce(() => {
        throw new InternalServerErrorException();
      });

      await expect(
        partyService.create({ partyCreateDto: inputPartyCreateDto, user: inputUser }),
      ).rejects.toThrow(InternalServerErrorException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('updateAndUserAndPlan', () => {
    it('party를 업데이트한다.', async () => {
      const inputPartyUpdateAndUserAndPlanDto: PartyUpdateAndUserAndPlanDto = {
        partyID: 'Party01',
        planID: 'Plan01',
        users: [],
      };

      const expectedPlanSave: Plan = mockPlan;
      const expectedIncrement: UpdateResult = { generatedMaps: [], affected: 1, raw: [] };
      const expectedFine: User_Point = mockUserPoint;

      jest.spyOn(planService, 'checkEnd').mockResolvedValue(expectedPlanSave);
      jest.spyOn(manager, 'save').mockResolvedValue(expectedPlanSave);
      jest.spyOn(manager, 'increment').mockResolvedValue(expectedIncrement);
      jest.spyOn(userPointService, 'fine').mockResolvedValue(expectedFine);

      const result: void = await partyService.updateAndUserAndPlan({
        partyUpdateAndUserAndPlanDto: inputPartyUpdateAndUserAndPlanDto,
      });

      expect(result).toBeUndefined();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('party 업데이트에 실패하면 롤백한다.', async () => {
      const inputPartyUpdateAndUserAndPlanDto: PartyUpdateAndUserAndPlanDto = {
        partyID: 'Party01',
        planID: 'Plan01',
        users: [],
      };

      jest.spyOn(manager, 'save').mockImplementationOnce(() => {
        throw new InternalServerErrorException();
      });

      jest.spyOn(manager, 'increment').mockImplementationOnce(() => {
        throw new InternalServerErrorException();
      });

      jest.spyOn(userPointService, 'fine').mockImplementationOnce(() => {
        throw new InternalServerErrorException();
      });

      await expect(
        partyService.updateAndUserAndPlan({
          partyUpdateAndUserAndPlanDto: inputPartyUpdateAndUserAndPlanDto,
        }),
      ).rejects.toThrow(InternalServerErrorException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('softDelete', () => {
    it('party를 소프트 삭제한다.', async () => {
      const inputPartySoftDeleteDto: PartySoftDeleteDto = { partyID: 'Party01' };

      const expectedParty: Party = mockParty;
      const expectedSoftDelete: UpdateResult = { generatedMaps: [], affected: 1, raw: [] };

      jest.spyOn(partyService, 'findOneWithPartyID').mockResolvedValue(expectedParty);
      jest.spyOn(manager, 'softDelete').mockResolvedValue(expectedSoftDelete);

      const result: boolean = await partyService.softDelete({
        partySoftDeleteDto: inputPartySoftDeleteDto,
      });

      expect(result).toBe(true);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('party 소프트 삭제에 실패하면 롤백한다.', async () => {
      const inputPartySoftDeleteDto: PartySoftDeleteDto = { partyID: 'Party01' };

      const expectedParty: Party = mockParty;

      jest.spyOn(partyService, 'findOneWithPartyID').mockResolvedValue(expectedParty);
      jest.spyOn(manager, 'softDelete').mockImplementationOnce(() => {
        throw new InternalServerErrorException();
      });

      await expect(
        partyService.softDelete({
          partySoftDeleteDto: inputPartySoftDeleteDto,
        }),
      ).rejects.toThrow(InternalServerErrorException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
