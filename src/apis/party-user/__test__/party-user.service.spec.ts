import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import { Party_UserService } from '../party-user.service';
import { Party_User } from '../party-user.entity';

describe('PartyUSerService', () => {
  let partyUserService: Party_UserService;
  let mockPartyUserRepository: Partial<Record<keyof Repository<Party_User>, jest.Mock>>;

  beforeEach(async () => {
    mockPartyUserRepository = {
      find: jest.fn(),
      insert: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Party_UserService,
        {
          provide: getRepositoryToken(Party_User),
          useValue: mockPartyUserRepository,
        },
      ],
    }).compile();

    partyUserService = module.get<Party_UserService>(Party_UserService);
  });

  const mockPartyUser: Party_User = {
    id: 'PartyUser01',
    party: { id: 'Party01', name: '파티명', point: 0, partyUsers: [], plans: [] },
    user: {
      id: 'User01',
      email: 'a@a.com',
      name: '철수',
      password: '1234',
      profileUrl: 'https://a.jpg',
      badgeUrl: 'https://b.jpg',
      friends: [],
      partyUsers: [],
    },
  };

  describe('findAllWithUserID', () => {
    it('userID에 해당하는 모든 partyUser를 반환한다.', async () => {
      const inputUserID: string = 'User01';

      const expectedFind: Party_User[] = [mockPartyUser];

      jest.spyOn(mockPartyUserRepository, 'find').mockResolvedValue(expectedFind);

      const result: Party_User[] = await partyUserService.findAllWithUserID({
        userID: inputUserID,
      });

      expect(result).toEqual(expectedFind);
      expect(mockPartyUserRepository.find).toHaveBeenCalledWith({
        where: { user: { id: inputUserID } },
        relations: ['party'],
      });
    });
  });

  describe('findAllWithPartyID', () => {
    it('userID에 해당하는 모든 partyUser를 반환한다.', async () => {
      const inputUserID: string = 'User01';

      const expectedFind: Party_User[] = [mockPartyUser];

      jest.spyOn(mockPartyUserRepository, 'find').mockResolvedValue(expectedFind);

      const result: Party_User[] = await partyUserService.findAllWithPartyID({
        partyID: inputUserID,
      });

      expect(result).toEqual(expectedFind);
      expect(mockPartyUserRepository.find).toHaveBeenCalledWith({
        where: { party: { id: inputUserID } },
        relations: ['user'],
      });
    });
  });

  describe('create', () => {
    it('partyUser를 생성 후 Insert 작업을 반환한다.', async () => {
      const inputPartyUserRelations = [{ party: { id: 'Party01' }, user: { id: 'User01' } }];

      const expectedFindAllUser: InsertResult = { generatedMaps: [], identifiers: [], raw: [] };

      jest.spyOn(mockPartyUserRepository, 'insert').mockResolvedValue(expectedFindAllUser);

      const result: InsertResult = await partyUserService.create({
        partyUserRelations: inputPartyUserRelations,
      });

      expect(result).toEqual(expectedFindAllUser);
    });
  });
});
