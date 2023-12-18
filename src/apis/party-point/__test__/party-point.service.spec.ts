import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PARTY_POINT_STATUS, Party_Point } from '../party-point.entity';
import { Party_PointService } from '../party-point.service';
import { User } from '../../user/user.entity';
import { Party } from '../../party/party.entity';
import { PartyPointUserSendDto } from '../party-point.dto';
import { UnprocessableEntityException } from '@nestjs/common';

describe('Party_PointService', () => {
  let partyPointService: Party_PointService;
  let mockPartyPointRepository: Partial<Record<keyof Repository<Party_Point>, jest.Mock>>;

  const manager = {
    save: jest.fn(),
    findOne: jest.fn(),
    increment: jest.fn(),
  };

  const queryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: manager,
  };

  beforeEach(async () => {
    mockPartyPointRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const mockDataSource = { createQueryRunner: jest.fn().mockReturnValue(queryRunner) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Party_PointService,
        { provide: getRepositoryToken(Party_Point), useValue: mockPartyPointRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    partyPointService = module.get<Party_PointService>(Party_PointService);
  });

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
    point: 1000,
    deletedAt: null,
    chats: [],
    markers: [],
    partyPoints: [],
    partyUsers: [],
    plans: [],
  };
  const mockPartyPoint: Party_Point = {
    id: 'PartyPoint01',
    userName: '철수',
    amount: 100,
    status: PARTY_POINT_STATUS.USER_SEND,
    createdAt: new Date(),
    deletedAt: null,
    party: mockParty,
  };

  describe('findWithPartyID', () => {
    it('partyID와 일치하는 모든 파티 포인트를 반환한다.', async () => {
      const inputPartyID: string = 'Party01';

      const expectedPartyPoint: Party_Point[] = [];

      jest.spyOn(mockPartyPointRepository, 'find').mockResolvedValue(expectedPartyPoint);

      const result: Party_Point[] = await partyPointService.findWithPartyID({
        partyID: inputPartyID,
      });

      expect(result).toEqual(expectedPartyPoint);
      expect(mockPartyPointRepository.find).toHaveBeenCalledWith({
        where: { party: { id: inputPartyID } },
      });
    });
  });

  describe('userSend', () => {
    const inputUSer: User = mockUser;
    const inputPartyPointUserSendDto: PartyPointUserSendDto = {
      partyID: 'Party01',
      amount: 100,
    };

    it('파티 포인트를 유저에게 보내고, 파티 포인트 내역을 반환한다.', async () => {
      const expectedParty: Party = mockParty;
      const expectedPartyPoint: Party_Point = mockPartyPoint;

      jest.spyOn(manager, 'findOne').mockResolvedValue(expectedParty);
      jest.spyOn(manager, 'save').mockResolvedValue(expectedPartyPoint);

      const result: Party_Point = await partyPointService.userSend({
        user: inputUSer,
        partyPointUserSendDto: inputPartyPointUserSendDto,
      });

      expect(result).toEqual(expectedPartyPoint);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('테이블 업데이트에 실패하면 롤백한다.', async () => {
      const expectedParty: Party = mockParty;

      expectedParty.point = inputPartyPointUserSendDto.amount - 1;

      jest.spyOn(manager, 'findOne').mockResolvedValue(expectedParty);

      await expect(
        partyPointService.userSend({
          user: inputUSer,
          partyPointUserSendDto: inputPartyPointUserSendDto,
        }),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
