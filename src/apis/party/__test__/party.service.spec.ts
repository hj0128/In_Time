import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {} from '@nestjs/common';
import { PartyService } from '../party.service';
import { Party } from '../party.entity';

class MockPartyRepository {
  myDB = [
    { name: '동아리 모임', members: '["U001", "U002"]', point: 0 },
    { name: '돼지 파티', members: '["U002", "U003"]', point: 1000 },
  ];

  find() {
    if (this.myDB) return this.myDB;

    return null;
  }

  save({ name, members, point = 0 }) {
    this.myDB.push({ name, members, point });

    return { name, members, point };
  }
}

describe('PartyService', () => {
  let partyService: PartyService;

  beforeEach(async () => {
    const partyModule = await Test.createTestingModule({
      providers: [
        PartyService,
        {
          provide: getRepositoryToken(Party),
          useClass: MockPartyRepository,
        },
      ],
    }).compile();

    partyService = partyModule.get<PartyService>(PartyService);
  });

  describe('findAll', () => {
    it('DB의 모든 party[] 가져오기', async () => {
      const result = await partyService.findAll();

      expect(result).toStrictEqual([
        { name: '동아리 모임', members: '["U001", "U002"]', point: 0 },
        { name: '돼지 파티', members: '["U002", "U003"]', point: 1000 },
      ]);
    });
  });

  describe('create', () => {
    it('DB에 party 저장', async () => {
      const partyCreateDto = { name: '공주들', members: '["U004", "U005"]' };
      const result = await partyService.create({ partyCreateDto });

      expect(result).toStrictEqual({
        name: '공주들',
        members: '["U004", "U005"]',
        point: 0,
      });
    });
  });
});
