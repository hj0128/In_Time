import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { JwtReqUser } from '../../../commons/interface/req.interface';
import { PlanController } from '../plan.controller';
import { PlanService } from '../plan.service';
import { Plan } from '../plan.entity';
import { Party } from 'src/apis/party/party.entity';
import { PlanCreateDto, PlanSoftDeleteDto } from '../plan.dto';

describe('PlanController', () => {
  let planController: PlanController;
  let planService: PlanService;

  beforeEach(async () => {
    const mockPlanService = {
      findOneWithPlanID: jest.fn(),
      findWithPartyID: jest.fn(),
      findWithUserIDAndPartyID: jest.fn(),
      create: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanController],
      providers: [
        { provide: PlanService, useValue: mockPlanService }, //
      ],
    }).compile();

    planController = module.get<PlanController>(PlanController);
    planService = module.get<PlanService>(PlanService);
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

  describe('planFindOneWithPlanID', () => {
    it('planID와 일치하는 plan을 반환한다.', async () => {
      const inputPlanID: string = 'Plan01';

      const expectedFindOneWithPlanID: Plan = mockPlan;

      jest.spyOn(planService, 'findOneWithPlanID').mockResolvedValueOnce(expectedFindOneWithPlanID);

      const result: Plan = await planController.planFindOneWithPlanID(inputPlanID);

      expect(result).toEqual(expectedFindOneWithPlanID);
      expect(planService.findOneWithPlanID).toHaveBeenCalledWith({ planID: inputPlanID });
    });
  });

  describe('planFindWithPartyID', () => {
    it('partyID와 일치하는 모든 plan을 반환한다.', async () => {
      const inputPartyID: string = 'Party01';

      const expectedFindWithPartyID: Plan[] = [mockPlan];

      jest.spyOn(planService, 'findWithPartyID').mockResolvedValueOnce(expectedFindWithPartyID);

      const result: Plan[] = await planController.planFindWithPartyID(inputPartyID);

      expect(result).toEqual(expectedFindWithPartyID);
      expect(planService.findWithPartyID).toHaveBeenCalledWith({ partyID: inputPartyID });
    });
  });

  describe('planFindWithUserIDAndPartyID', () => {
    it('로그인 user의 모든 plan을 반환한다.', async () => {
      const inputReq: Request & JwtReqUser = mockReq;

      const expectedFindWithUserIDAndPartyID: Plan[] = [mockPlan];

      jest
        .spyOn(planService, 'findWithUserIDAndPartyID')
        .mockResolvedValueOnce(expectedFindWithUserIDAndPartyID);

      const result: Plan[] = await planController.planFindWithUserIDAndPartyID(inputReq);

      expect(result).toEqual(expectedFindWithUserIDAndPartyID);
      expect(planService.findWithUserIDAndPartyID).toHaveBeenCalledWith({ user: inputReq.user });
    });
  });

  describe('planCreate', () => {
    it('plan을 생성한 후 생성된 plan을 반환한다.', async () => {
      const inputPlanCreateDto: PlanCreateDto = {
        planName: '플랜명',
        placeName: '미진삼겹살',
        placeAddress: '대구 달서구 월성동 1195-1',
        placeLat: 35.8668,
        placeLng: 128.6015,
        date: '2023-11-11T19:30',
        fine: 5000,
        partyID: mockParty.id,
      };

      const expectedCreate: Plan = mockPlan;

      jest.spyOn(planService, 'create').mockResolvedValueOnce(expectedCreate);

      const result: Plan = await planController.planCreate(inputPlanCreateDto);

      expect(result).toEqual(expectedCreate);
      expect(planService.create).toHaveBeenCalledWith({ planCreateDto: inputPlanCreateDto });
    });
  });

  describe('planSoftDelete', () => {
    it('약속을 소프트 삭제한다.', async () => {
      const inputPlanSoftDeleteDto: PlanSoftDeleteDto = { planID: 'Plan01' };

      jest.spyOn(planService, 'softDelete').mockResolvedValueOnce(true);

      const result: boolean = await planController.planSoftDelete(inputPlanSoftDeleteDto);

      expect(result).toBe(true);
      expect(planService.softDelete).toHaveBeenCalledWith({
        planSoftDeleteDto: inputPlanSoftDeleteDto,
      });
    });
  });
});
