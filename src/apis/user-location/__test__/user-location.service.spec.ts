import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { User_Location } from '../user-location.entity';
import { User_LocationService } from '../user-location.service';
import { JwtReqUser } from '../../../commons/interface/req.interface';
import { User } from '../../user/user.entity';
import { UserLocationCreateDto } from '../user-location.dto';
import { UserLocationInfo } from '../user-location.interface';
import { Party } from 'src/apis/party/party.entity';
import { Plan } from 'src/apis/plan/plan.entity';

describe('User_LocationService', () => {
  let userLocationService: User_LocationService;
  let mockUserLocationRepository: Partial<Record<keyof Repository<User_Location>, jest.Mock>>;
  let cacheManager: any;

  beforeEach(async () => {
    mockUserLocationRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        User_LocationService,
        { provide: getRepositoryToken(User_Location), useValue: mockUserLocationRepository },
      ],
    }).compile();

    userLocationService = module.get<User_LocationService>(User_LocationService);
    cacheManager = module.get<any>(CACHE_MANAGER);
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
    profileUrl: 'https://a.jpg',
    badgeUrl: 'https://b.jpg',
    deletedAt: null,
    partyUsers: [],
    friends: [],
    userPoints: [],
    userLocations: [],
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
  const mockUserLocation: User_Location = {
    id: 'UserLocation01',
    name: '철수',
    lat: 12.203,
    lng: 15.205,
    time: '2023. 11. 30. 오전 11:01:46',
    isArrive: false,
    deletedAt: null,
    user: mockUser,
    planID: mockPlan.id,
  };
  const mockUserLocationInfo: UserLocationInfo = {
    name: '철수',
    lat: 12.203,
    lng: 15.205,
    time: '2023. 11. 30. 오전 11:01:46',
    isArrive: true,
  };

  describe('findOneWithNameAndPlanID', () => {
    it('user의 name으로 DB에서 일치하는 userLocation 정보를 가져온다.', async () => {
      const inputName: string = mockUser.name;

      const expectedUserLocation: User_Location = mockUserLocation;

      jest.spyOn(mockUserLocationRepository, 'findOne').mockResolvedValue(expectedUserLocation);

      const result: User_Location = await userLocationService.findOneWithNameAndPlanID({
        name: inputName,
        planID: mockPlan.id,
      });

      expect(result).toEqual(expectedUserLocation);
      expect(mockUserLocationRepository.findOne).toHaveBeenCalledWith({
        where: { name: inputName, planID: mockPlan.id },
      });
    });
  });

  describe('create', () => {
    it('userLocation 정보를 MySQL과 Redis에 저장하고 MySQL에 저장한 값을 반환한다.', async () => {
      const inputUser: JwtReqUser['user'] = mockJwtReqUser;
      const inputUserLocationCreateDto: UserLocationCreateDto = {
        lat: 12.203,
        lng: 15.205,
        time: '2023. 11. 30. 오전 11:01:46',
        isArrive: true,
        planID: mockPlan.id,
      };

      const expectedUserLocation: User_Location = mockUserLocation;
      const expectedUserLocationInfo: UserLocationInfo = mockUserLocationInfo;

      jest.spyOn(mockUserLocationRepository, 'save').mockResolvedValue(expectedUserLocation);
      jest.spyOn(cacheManager, 'set').mockResolvedValue(expectedUserLocationInfo);

      const result: User_Location = await userLocationService.create({
        user: inputUser,
        userLocationCreateDto: inputUserLocationCreateDto,
      });

      expect(result).toEqual(expectedUserLocation);
      expect(cacheManager.set).toHaveBeenCalledWith(
        `${inputUser.name}:${inputUserLocationCreateDto.planID}`,
        { name: inputUser.name, ...inputUserLocationCreateDto },
        { ttl: 3600 },
      );
    });
  });

  describe('findWithUsersName', () => {
    const inputUsersName: string[] = ['철수'];
    const expectedUserLocationInfo: UserLocationInfo[] = [];
    it('Redis에 userLocation 정보가 있으면 가져온다.', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(expectedUserLocationInfo);

      const result: UserLocationInfo[] = await userLocationService.findWithUsersName({
        usersName: inputUsersName,
        planID: mockPlan.id,
      });

      expect(result).toEqual([expectedUserLocationInfo]);
      expect(cacheManager.get).toHaveBeenCalledWith(`${inputUsersName[0]}:${mockPlan.id}`);
    });

    it('Redis에 userLocation 정보가 없으면 MySQL에서 가져온다.', async () => {
      const expectedUserLocation: User_Location = mockUserLocation;

      jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined);
      jest
        .spyOn(userLocationService, 'findOneWithNameAndPlanID')
        .mockResolvedValue(expectedUserLocation);
      jest.spyOn(cacheManager, 'set').mockResolvedValue(expectedUserLocationInfo);

      const result: UserLocationInfo[] = await userLocationService.findWithUsersName({
        usersName: inputUsersName,
        planID: mockPlan.id,
      });

      expect(result).toEqual(expectedUserLocationInfo);
    });
  });
});
