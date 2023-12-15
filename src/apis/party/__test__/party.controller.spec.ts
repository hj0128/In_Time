import { Test, TestingModule } from '@nestjs/testing';
import { PartyController } from '../party.controller';
import { PartyService } from '../party.service';
import { Party } from '../party.entity';
import {
  FindOneWithPartyIDDto,
  PartyCreateDto,
  PartySoftDeleteDto,
  PartyUpdateAndUserAndPlanDto,
} from '../party.dto';
import { Request } from 'express';
import { JwtReqUser } from '../../../commons/interface/req.interface';
import { PartyList } from '../party.interface';

describe('PartyController', () => {
  let partyController: PartyController;
  let partyService: PartyService;

  beforeEach(async () => {
    const mockPartyService = {
      findWithUserID: jest.fn(),
      findOneWithPartyID: jest.fn(),
      create: jest.fn(),
      updateAndUserAndPlan: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartyController],
      providers: [
        { provide: PartyService, useValue: mockPartyService }, //
      ],
    }).compile();

    partyController = module.get<PartyController>(PartyController);
    partyService = module.get<PartyService>(PartyService);
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

  describe('partyFindAll', () => {
    it('로그인 유저의 모든 party를 배열로 가져온다.', async () => {
      const inputReq: Request & JwtReqUser = mockReq;

      const expectedFindAllWithUser: PartyList[] = [];

      jest.spyOn(partyService, 'findWithUserID').mockResolvedValueOnce(expectedFindAllWithUser);

      const result: PartyList[] = await partyController.partyFindAll(inputReq);

      expect(result).toEqual(expectedFindAllWithUser);
      expect(partyService.findWithUserID).toHaveBeenCalledWith({ userID: inputReq.user.id });
    });
  });

  describe('partyFindOneWithPartyID', () => {
    it('partyID와 일치하는 party를 가져온다.', async () => {
      const inputFindOneWithPartyIDDto: FindOneWithPartyIDDto = { partyID: 'Party01' };

      const expectedFindOneWithPartyID: Party = mockParty;

      jest
        .spyOn(partyService, 'findOneWithPartyID')
        .mockResolvedValueOnce(expectedFindOneWithPartyID);

      const result: Party = await partyController.partyFindOneWithPartyID(
        inputFindOneWithPartyIDDto,
      );

      expect(result).toEqual(expectedFindOneWithPartyID);
      expect(partyService.findOneWithPartyID).toHaveBeenCalledWith({
        partyID: inputFindOneWithPartyIDDto.partyID,
      });
    });
  });

  describe('partyCreate', () => {
    it('로그인 유저의 party를 생성하여 DB에 저장한다.', async () => {
      const inputReq: Request & JwtReqUser = mockReq;
      const inputPartyCreateDto: PartyCreateDto = { name: '파티명', friendsID: 'Friend01' };

      const expectedCreate: Party = mockParty;

      jest.spyOn(partyService, 'create').mockResolvedValueOnce(expectedCreate);

      const result: Party = await partyController.partyCreate(inputPartyCreateDto, inputReq);

      expect(result).toEqual(expectedCreate);
      expect(partyService.create).toHaveBeenCalledWith({
        partyCreateDto: inputPartyCreateDto,
        user: inputReq.user,
      });
    });
  });

  describe('partyUpdateAndUserAndPlan', () => {
    it('약속 시간이 끝난 후 party, user, plan을 업데이트한다.', async () => {
      const inputPartyUpdateAndUserAndPlanDto: PartyUpdateAndUserAndPlanDto = {
        partyID: 'Party01',
        planID: 'Plan01',
        users: [],
      };

      jest.spyOn(partyService, 'updateAndUserAndPlan').mockResolvedValueOnce(undefined);

      const result: void = await partyController.partyUpdateAndUserAndPlan(
        inputPartyUpdateAndUserAndPlanDto,
      );

      expect(result).toBeUndefined();
      expect(partyService.updateAndUserAndPlan).toHaveBeenCalledWith({
        partyUpdateAndUserAndPlanDto: inputPartyUpdateAndUserAndPlanDto,
      });
    });
  });

  describe('partySoftDelete', () => {
    it('파티를 소프트 삭제한다.', async () => {
      const inputPartySoftDeleteDto: PartySoftDeleteDto = { partyID: 'Party01' };

      jest.spyOn(partyService, 'softDelete').mockResolvedValueOnce(true);

      const result: boolean = await partyController.partySoftDelete(inputPartySoftDeleteDto);

      expect(result).toBe(true);
      expect(partyService.softDelete).toHaveBeenCalledWith({
        partySoftDeleteDto: inputPartySoftDeleteDto,
      });
    });
  });
});
