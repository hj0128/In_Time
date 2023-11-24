import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { JwtReqUser } from '../../../commons/interface/req.interface';
import { PlanController } from '../plan.controller';
import { PlanService } from '../plan.service';
import { Plan } from '../plan.entity';
import { Party } from 'src/apis/party/party.entity';
import { PlanCreateDto } from '../plan.dto';

describe('PlanController', () => {
  let planController: PlanController;
  let planService: PlanService;

  beforeEach(async () => {
    const mockplanService = {
      findOneWithPlanID: jest.fn(),
      findWithPartyID: jest.fn(),
      findWithUserIDAndPartyID: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanController],
      providers: [
        {
          provide: PlanService,
          useValue: mockplanService,
        },
      ],
    }).compile();

    planController = module.get<PlanController>(PlanController);
    planService = module.get<PlanService>(PlanService);
  });

  const mockReq: Request & JwtReqUser = { user: { id: 'User01' } } as Request & JwtReqUser;

  const mockParty: Party = {
    id: 'Party01',
    name: '파티명',
    point: 0,
    partyUsers: [],
    plans: [],
  };

  const mockPlan: Plan = {
    id: 'Plan01',
    planName: '플랜명',
    placeName: '장소명',
    placeAddress: '주소',
    placeLat: 12.203,
    placeLng: 15.206,
    date: '2023-11-30',
    fine: 5000,
    fineType: '1회',
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
        placeName: '장소',
        placeAddress: '주소',
        placeLat: 12.203,
        placeLng: 15.205,
        date: '2023-11-30',
        fine: 5000,
        fineType: '1회',
        partyID: 'Party01',
      };

      const expectedCreate: Plan = mockPlan;

      jest.spyOn(planService, 'create').mockResolvedValueOnce(expectedCreate);

      const result: Plan = await planController.planCreate(inputPlanCreateDto);

      expect(result).toEqual(expectedCreate);
      expect(planService.create).toHaveBeenCalledWith({ planCreateDto: inputPlanCreateDto });
    });
  });
});
