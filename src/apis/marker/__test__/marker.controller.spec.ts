import { Test, TestingModule } from '@nestjs/testing';
import { MarkerController } from '../marker.controller';
import { MarkerService } from '../marker.service';
import { Marker } from '../marker.entity';
import { Party } from 'src/apis/party/party.entity';
import { MarkerCreateDto, MarkerDeleteDto } from '../marker.dto';

describe('MarkerController', () => {
  let markerController: MarkerController;
  let markerService: MarkerService;

  beforeEach(async () => {
    const mockMarkerService = {
      findAllWithPartyID: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarkerController],
      providers: [
        { provide: MarkerService, useValue: mockMarkerService }, //
      ],
    }).compile();

    markerController = module.get<MarkerController>(MarkerController);
    markerService = module.get<MarkerService>(MarkerService);
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
  const mockMarker: Marker = {
    id: 'Marker01',
    name: '미진삼겹살',
    address: '대구 달서구 월성동 1195-1',
    lat: 35.8668,
    lng: 128.6015,
    deletedAt: null,
    party: mockParty,
  };

  describe('markerFindAllWithPartyID', () => {
    it('해당 party의 marker를 찾는다.', async () => {
      const inputPartyID: string = 'Party01';

      const expectedFindAllWithPartyID: Marker[] = [];

      jest
        .spyOn(markerService, 'findAllWithPartyID')
        .mockResolvedValueOnce(expectedFindAllWithPartyID);

      const result: Marker[] = await markerController.markerFindAllWithPartyID(inputPartyID);

      expect(result).toEqual(expectedFindAllWithPartyID);
      expect(markerService.findAllWithPartyID).toHaveBeenCalledWith({
        partyID: inputPartyID,
      });
    });
  });

  describe('markerCreate', () => {
    it('party에서 등록한 marker를 DB에 저장한다.', async () => {
      const inputMarkerCreateDto: MarkerCreateDto = {
        name: '미진삼겹살',
        address: '대구 달서구 월성동 1195-1',
        lat: 35.8668,
        lng: 128.6015,
        partyID: mockParty.id,
      };

      const expectedCreate: Marker = mockMarker;

      jest.spyOn(markerService, 'create').mockResolvedValueOnce(expectedCreate);

      const result: Marker = await markerController.markerCreate(inputMarkerCreateDto);

      expect(result).toEqual(expectedCreate);
      expect(markerService.create).toHaveBeenCalledWith({
        markerCreateDto: inputMarkerCreateDto,
      });
    });
  });

  describe('markerDelete', () => {
    it('party에 등록된 marker를 삭제한다.', async () => {
      const inputMarkerDeleteDto: MarkerDeleteDto = {
        lat: 35.8668,
        lng: 128.6015,
        partyID: mockParty.id,
      };

      jest.spyOn(markerService, 'create').mockResolvedValueOnce(undefined);

      const result: void = await markerController.markerDelete(inputMarkerDeleteDto);

      expect(result).toBeUndefined();
      expect(markerService.delete).toHaveBeenCalledWith({
        markerDeleteDto: inputMarkerDeleteDto,
      });
    });
  });
});
