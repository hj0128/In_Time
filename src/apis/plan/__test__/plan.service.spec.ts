import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { JwtReqUser } from '../../../commons/interface/req.interface';
import { PlanService } from '../plan.service';
import { Party_UserService } from '../../party-user/party-user.service';
import { Plan } from '../plan.entity';
import { User } from '../../user/user.entity';
import { Party } from '../../party/party.entity';
import { Party_User } from 'src/apis/party-user/party-user.entity';
import { PlanCreateDto } from '../plan.dto';

describe('PlanService', () => {
  let planService: PlanService;
  let partyUserService: Party_UserService;
  let mockPlanRepository: Partial<Record<keyof Repository<Plan>, jest.Mock>>;

  beforeEach(async () => {
    const mockPartyUserService = {
      findAllWithUserID: jest.fn(),
    };

    mockPlanRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanService,
        {
          provide: getRepositoryToken(Plan),
          useValue: mockPlanRepository,
        },
        {
          provide: Party_UserService,
          useValue: mockPartyUserService,
        },
      ],
    }).compile();

    planService = module.get<PlanService>(PlanService);
    partyUserService = module.get<Party_UserService>(Party_UserService);
  });

  const mockUser: User = {
    id: 'User01',
    name: '철수',
    email: 'a@a.com',
    password: '1234',
    profileUrl: 'https://a.jpg',
    badgeUrl: 'https://b.jpg',
    partyUsers: [],
    friends: [],
  };

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
    placeName: '장소',
    placeAddress: '주소',
    placeLat: 12.203,
    placeLng: 15.205,
    date: '2023-11-30',
    fine: 5000,
    fineType: '1회',
    party: mockParty,
  };

  const mockJwtReqUser: JwtReqUser['user'] = {
    id: 'User01',
    name: '철수',
    email: 'a@a.com',
    password: '1234',
    profileUrl: 'https://b.jpg',
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
      const expectedFindAllWithUserID: Party_User[] = [
        { id: 'Party01', party: mockParty, user: mockUser },
      ];

      jest
        .spyOn(partyUserService, 'findAllWithUserID')
        .mockResolvedValue(expectedFindAllWithUserID);

      await planService.findWithUserIDAndPartyID({ user: inputUser });

      expect(partyUserService.findAllWithUserID).toHaveBeenCalledWith({ userID: inputUser.id });
    });

    it('로그인 user의 모든 plan을 반환한다.', async () => {
      const inputFind: string[] = ['Party01'];

      const expectedFind: Plan[] = [mockPlan];
      const expectedFindAllWithUserID: Party_User[] = [
        { id: 'Party01', party: mockParty, user: mockUser },
      ];

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
        fineType: '1회',
        partyID: 'Party01',
      };

      const expectedSave: Plan = mockPlan;

      jest.spyOn(mockPlanRepository, 'save').mockResolvedValue(expectedSave);

      const result = await planService.create({ planCreateDto: inputPlanCreateDto });

      expect(result).toEqual(expectedSave);
      expect(mockPlanRepository.save).toHaveBeenCalledWith({
        planName: '플랜명',
        placeName: '장소',
        placeAddress: '주소',
        placeLat: 12.203,
        placeLng: 15.205,
        date: '2023-11-30',
        fine: 5000,
        fineType: '1회',
        party: {
          id: 'Party01',
        },
      });
    });
  });
});
