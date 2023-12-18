import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Party_UserService } from '../party-user.service';
import { Party_User } from '../party-user.entity';
import { DataSource, InsertResult, QueryRunner, Repository } from 'typeorm';
import { Party } from 'src/apis/party/party.entity';
import { User } from 'src/apis/user/user.entity';
import { ForbiddenException } from '@nestjs/common';

const manager = {
  insert: jest.fn(),
};

const queryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: manager,
};

describe('Party_UserService', () => {
  let partyUserService: Party_UserService;
  let mockPartyUserService: Partial<Record<keyof Repository<Party_User>, jest.Mock>>;
  let dataSource: DataSource;

  beforeEach(async () => {
    mockPartyUserService = {
      find: jest.fn(),
    };

    const mockDataSource = { createQueryRunner: jest.fn().mockReturnValue(queryRunner) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Party_UserService,
        { provide: getRepositoryToken(Party_User), useValue: mockPartyUserService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    partyUserService = module.get<Party_UserService>(Party_UserService);
    dataSource = module.get<DataSource>(DataSource);
  });

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
  const mockPartyUser: Party_User = {
    id: 'PartyUser01',
    deletedAt: null,
    party: mockParty,
    user: mockUser,
  };

  describe('findAllWithUserID', () => {
    it('userID와 일치하는 모든 파티 유저를 반환한다.', async () => {
      const inputUserID: string = 'User01';

      const expectedPartyUser: Party_User[] = [];

      jest.spyOn(mockPartyUserService, 'find').mockResolvedValue(expectedPartyUser);

      const result: Party_User[] = await partyUserService.findAllWithUserID({
        userID: inputUserID,
      });

      expect(result).toEqual(expectedPartyUser);
      expect(mockPartyUserService.find).toHaveBeenCalledWith({
        where: { user: { id: inputUserID } },
        relations: ['party'],
      });
    });
  });

  describe('findAllWithPartyID', () => {
    it('partyID와 일치하는 모든 파티 유저를 반환한다.', async () => {
      const inputPartyID: string = 'Party01';

      const expectedPartyUser: Party_User[] = [];

      jest.spyOn(mockPartyUserService, 'find').mockResolvedValue(expectedPartyUser);

      const result: Party_User[] = await partyUserService.findAllWithPartyID({
        partyID: inputPartyID,
      });

      expect(result).toEqual(expectedPartyUser);
      expect(mockPartyUserService.find).toHaveBeenCalledWith({
        where: { party: { id: inputPartyID } },
        relations: ['user', 'party'],
      });
    });
  });

  describe('create', () => {
    it('파티 유저를 생성한다.', async () => {
      const inputPartyUserRelations: { party: { id: string }; user: { id: string } }[] = [];
      const inputQueryRunner: QueryRunner = dataSource.createQueryRunner();

      const expectedInsert: InsertResult = { generatedMaps: [], identifiers: [], raw: [] };

      jest.spyOn(manager, 'insert').mockResolvedValue(expectedInsert);

      const result: InsertResult = await partyUserService.create({
        partyUserRelations: inputPartyUserRelations,
        queryRunner: inputQueryRunner,
      });

      expect(result).toEqual(expectedInsert);
      expect(manager.insert).toHaveBeenCalledWith(Party_User, inputPartyUserRelations);
    });
  });

  describe('checkPartyMembers', () => {
    const inputUserID: string = 'User01';

    const expectedPartyUser: Party_User[] = [mockPartyUser];
    const expectedPartyUser2: Party_User[] = [mockPartyUser, mockPartyUser];

    it('파티에 유저가 존재하는지 확인한다.', async () => {
      jest.spyOn(partyUserService, 'findAllWithUserID').mockResolvedValue(expectedPartyUser);
      jest.spyOn(partyUserService, 'findAllWithPartyID').mockResolvedValue(expectedPartyUser2);

      await expect(
        partyUserService.checkPartyMembers({ userID: inputUserID }),
      ).resolves.toBeUndefined();
    });

    it('파티에 유저가 하나뿐이면 예외를 던진다.', async () => {
      jest.spyOn(partyUserService, 'findAllWithUserID').mockResolvedValue(expectedPartyUser);
      jest.spyOn(partyUserService, 'findAllWithPartyID').mockResolvedValue(expectedPartyUser);

      await expect(partyUserService.checkPartyMembers({ userID: inputUserID })).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
