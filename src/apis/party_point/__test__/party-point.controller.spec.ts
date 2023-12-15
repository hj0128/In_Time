import { Test, TestingModule } from '@nestjs/testing';

import { Party } from 'src/apis/party/party.entity';
import { Party_PointController } from '../party-point.controller';
import { Party_PointService } from '../party-point.service';
import { PARTY_POINT_STATUS, Party_Point } from '../party-point.entity';
import { PartyPointUserSendDto } from '../party-point.dto';
import { JwtReqUser } from 'src/commons/interface/req.interface';

describe('Party_PointController', () => {
  let partyPointController: Party_PointController;
  let partyPointService: Party_PointService;

  beforeEach(async () => {
    const mockPartyPointService = {
      findWithPartyID: jest.fn(),
      userSend: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [Party_PointController],
      providers: [
        { provide: Party_PointService, useValue: mockPartyPointService }, //
      ],
    }).compile();

    partyPointController = module.get<Party_PointController>(Party_PointController);
    partyPointService = module.get<Party_PointService>(Party_PointService);
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
  const mockPartyPoint: Party_Point = {
    id: 'PartyPoint01',
    amount: 0,
    userName: '철수',
    status: PARTY_POINT_STATUS.USER_SEND,
    createdAt: new Date(),
    deletedAt: null,
    party: mockParty,
  };

  describe('partyPointFindWithPartyID', () => {
    it('해당하는 partyID의 point 내역을 찾는다.', async () => {
      const inputPartyID: string = 'Party01';

      const expectedFindWithPartyID: Party_Point[] = [];

      jest
        .spyOn(partyPointService, 'findWithPartyID')
        .mockResolvedValueOnce(expectedFindWithPartyID);

      const result: Party_Point[] =
        await partyPointController.partyPointFindWithPartyID(inputPartyID);

      expect(result).toEqual(expectedFindWithPartyID);
      expect(partyPointService.findWithPartyID).toHaveBeenCalledWith({
        partyID: inputPartyID,
      });
    });
  });

  describe('partyPointUserSend', () => {
    it('party의 포인트를 user에게 보낸다.', async () => {
      const inputReq: Request & JwtReqUser = mockReq;
      const inputPartyPointUserSendDto: PartyPointUserSendDto = {
        partyID: 'Party01',
        amount: 1000,
      };

      const expectedUserSend: Party_Point = mockPartyPoint;

      jest.spyOn(partyPointService, 'userSend').mockResolvedValueOnce(expectedUserSend);

      const result: Party_Point = await partyPointController.partyPointUserSend(
        inputReq,
        inputPartyPointUserSendDto,
      );

      expect(result).toEqual(expectedUserSend);
      expect(partyPointService.userSend).toHaveBeenCalledWith({
        user: inputReq.user,
        partyPointUserSendDto: inputPartyPointUserSendDto,
      });
    });
  });
});
