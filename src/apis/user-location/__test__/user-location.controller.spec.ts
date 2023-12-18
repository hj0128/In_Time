import { Test, TestingModule } from '@nestjs/testing';
import { JwtReqUser } from 'src/commons/interface/req.interface';
import { User_LocationController } from '../user-location.controller';
import { User_LocationService } from '../user-location.service';
import { UserLocationCreateDto } from '../user-location.dto';
import { User_Location } from '../user-location.entity';
import { UserLocationInfo } from '../user-location.interface';
import { User } from 'src/apis/user/user.entity';
import { Plan } from 'src/apis/plan/plan.entity';
import { Party } from 'src/apis/party/party.entity';

describe('User_LocationController', () => {
  let userLocationController: User_LocationController;
  let userLocationService: User_LocationService;

  beforeEach(async () => {
    const mockUserLocationService = {
      create: jest.fn(),
      findWithUsersName: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [User_LocationController],
      providers: [
        { provide: User_LocationService, useValue: mockUserLocationService }, //
      ],
    }).compile();

    userLocationController = module.get<User_LocationController>(User_LocationController);
    userLocationService = module.get<User_LocationService>(User_LocationService);
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

  describe('userLocationCreate', () => {
    it('user의 위치 정보를 DB에 저장한다.', async () => {
      const inputReq: Request & JwtReqUser = mockReq;
      const inputUserLocationCreateDto: UserLocationCreateDto = {
        lat: 12.203,
        lng: 15.205,
        time: '2023. 11. 30. 오전 11:01:46',
        isArrive: false,
        planID: mockPlan.id,
      };

      const expectedUserLocation: User_Location = mockUserLocation;

      jest.spyOn(userLocationService, 'create').mockResolvedValueOnce(expectedUserLocation);

      const result: User_Location = await userLocationController.userLocationCreate(
        inputReq,
        inputUserLocationCreateDto,
      );

      expect(result).toEqual(expectedUserLocation);
      expect(userLocationService.create).toHaveBeenCalledWith({
        user: inputReq.user,
        userLocationCreateDto: inputUserLocationCreateDto,
      });
    });
  });

  describe('userLocationFindWithUsersName', () => {
    it('DB에서 userName과 일치하는 user의 위치 정보를 가져온다.', async () => {
      const inputUsersName: string[] = ['철수'];
      const inputPlanID: string = mockPlan.id;

      const expectedUserLocationInfo: UserLocationInfo[] = [];

      jest
        .spyOn(userLocationService, 'findWithUsersName')
        .mockResolvedValueOnce(expectedUserLocationInfo);

      const result: UserLocationInfo[] = await userLocationController.userLocationFindWithUsersName(
        {
          usersName: inputUsersName,
          planID: inputPlanID,
        },
      );

      expect(result).toEqual(expectedUserLocationInfo);
      expect(userLocationService.findWithUsersName).toHaveBeenCalledWith({
        usersName: inputUsersName,
        planID: inputPlanID,
      });
    });
  });
});
