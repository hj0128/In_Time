import { Test, TestingModule } from '@nestjs/testing';
import { PartyController } from '../party.controller';
import { PartyService } from '../party.service';
import { Party } from '../party.entity';
import { PartyCreateDto } from '../party.dto';
import { Request } from 'express';
import { JwtReqUser } from '../../../commons/interface/req.interface';

describe('PartyController', () => {
  let partyController: PartyController;
  let partyService: PartyService;

  beforeEach(async () => {
    const mockPartyService = {
      findAllWithUser: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartyController],
      providers: [
        {
          provide: PartyService,
          useValue: mockPartyService,
        },
      ],
    }).compile();

    partyController = module.get<PartyController>(PartyController);
    partyService = module.get<PartyService>(PartyService);
  });

  const mockReq: Request & JwtReqUser = {} as Request & JwtReqUser;

  describe('partyFindAll', () => {
    it('로그인 유저의 모든 party를 배열로 가져온다.', async () => {
      const inputReq: Request & JwtReqUser = mockReq;

      const expectedFindAllWithUser: Party[] = [];

      jest.spyOn(partyService, 'findAllWithUser').mockResolvedValueOnce(expectedFindAllWithUser);

      const result: Party[] = await partyController.partyFindAll(inputReq);

      expect(result).toEqual(expectedFindAllWithUser);
      expect(partyService.findAllWithUser).toHaveBeenCalledWith({ user: inputReq.user });
    });
  });

  describe('partyCreate', () => {
    it('party를 생성하여 생성한 party를 반환한다.', async () => {
      const inputPartyCreateDto: PartyCreateDto = { friendsID: '', name: '' };
      const inputReq: Request & JwtReqUser = mockReq;

      const expectedCreate: Party = { id: '', name: '', point: 0, plans: [], partyUsers: [] };

      jest.spyOn(partyService, 'create').mockResolvedValueOnce(expectedCreate);

      const result: Party = await partyController.partyCreate(inputPartyCreateDto, inputReq);

      expect(result).toEqual(expectedCreate);
      expect(partyService.create).toHaveBeenCalledWith({
        partyCreateDto: inputPartyCreateDto,
        user: inputReq.user,
      });
    });
  });
});
