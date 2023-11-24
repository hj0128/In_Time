import { Test, TestingModule } from '@nestjs/testing';
import { PartyService } from '../party.service';
import { Party_UserService } from '../../party-user/party-user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Party } from '../party.entity';
import { JwtReqUser } from '../../../commons/interface/req.interface';
import { PartyCreateDto } from '../party.dto';
import { InsertResult, Repository } from 'typeorm';

describe('PartyService', () => {
  let partyService: PartyService;
  let partyUserService: Party_UserService;
  let mockPartyRepository: Partial<Record<keyof Repository<Party>, jest.Mock>>;

  beforeEach(async () => {
    const mockPartyUserService = {
      create: jest.fn(),
    };

    mockPartyRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartyService,
        {
          provide: getRepositoryToken(Party),
          useValue: mockPartyRepository,
        },
        {
          provide: Party_UserService,
          useValue: mockPartyUserService,
        },
      ],
    }).compile();

    partyService = module.get<PartyService>(PartyService);
    partyUserService = module.get<Party_UserService>(Party_UserService);
  });

  const mockParty: Party = {
    id: 'Party01',
    name: '파티명',
    point: 0,
    plans: [],
    partyUsers: [],
  };

  const mockJwtReqUser: JwtReqUser['user'] = {
    id: 'User01',
    name: '철수',
    email: 'a@a.com',
    password: '1234',
    profileUrl: 'https://b.jpg',
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

  describe('findAllWithUser', () => {
    it('userID에 해당하는 모든 party(partyUsers, user 포함)를 반환한다.', async () => {
      const inputUser: JwtReqUser['user'] = mockJwtReqUser;

      const expectedFind: Party[] = [mockParty];

      jest.spyOn(mockPartyRepository, 'find').mockResolvedValue(expectedFind);

      const result: Party[] = await partyService.findAllWithUser({ user: inputUser });

      expect(result).toEqual(expectedFind);
      expect(mockPartyRepository.find).toHaveBeenCalledWith({
        where: { partyUsers: { user: { id: inputUser.id } } },
      });
    });
  });

  describe('create', () => {
    it('party를 생성하고 생성한 party를 반환한다.', async () => {
      const inputPartyCreateDto: PartyCreateDto = {
        name: '파티명2',
        friendsID: '["U001", "U002"]',
      };
      const inputUser: JwtReqUser['user'] = mockJwtReqUser;

      const expectedSave: Party = {
        id: 'Party02',
        name: '파티명2',
        point: 0,
        plans: [],
        partyUsers: [],
      };
      const expectedCreate: InsertResult = { generatedMaps: [], identifiers: [], raw: [] };

      jest.spyOn(mockPartyRepository, 'save').mockResolvedValue(expectedSave);
      jest.spyOn(partyUserService, 'create').mockResolvedValue(expectedCreate);

      const result: Party = await partyService.create({
        partyCreateDto: inputPartyCreateDto,
        user: inputUser,
      });

      expect(result).toEqual(expectedSave);
      expect(mockPartyRepository.save).toHaveBeenCalledWith({ name: inputPartyCreateDto.name });
      expect(partyUserService.create).toHaveBeenCalledWith({
        partyUserRelations: [
          { party: { id: 'Party02' }, user: { id: 'U001' } },
          { party: { id: 'Party02' }, user: { id: 'U002' } },
          { party: { id: 'Party02' }, user: { id: 'User01' } },
        ],
      });
    });
  });
});
