import { Test, TestingModule } from '@nestjs/testing';
import { Marker } from '../marker.entity';
import { MarkerService } from '../marker.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Party } from 'src/apis/party/party.entity';
import { Repository } from 'typeorm';
import { MarkerCreateDto, MarkerDeleteDto, MarkerFindOneWithLatLngDto } from '../marker.dto';
import { ConflictException } from '@nestjs/common';

describe('MarkerService', () => {
  let markerService: MarkerService;
  let mockMarkerRepository: Partial<Record<keyof Repository<Marker>, jest.Mock>>;

  beforeEach(async () => {
    mockMarkerRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarkerService,
        { provide: getRepositoryToken(Marker), useValue: mockMarkerRepository },
      ],
    }).compile();

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

  describe('findAllWithPartyID', () => {
    it('partyID와 일치하는 모든 마커를 반환한다.', async () => {
      const inputPartyID: string = 'Party01';

      const expectedMarker: Marker[] = [];

      jest.spyOn(mockMarkerRepository, 'find').mockResolvedValue(expectedMarker);

      const result: Marker[] = await markerService.findAllWithPartyID({ partyID: inputPartyID });

      expect(result).toEqual(expectedMarker);
      expect(mockMarkerRepository.find).toHaveBeenCalledWith({
        where: { party: { id: inputPartyID } },
      });
    });
  });

  describe('findOneWithLatLng', () => {
    it('partyID, lat, lng와 일치하는 마커를 반환한다.', async () => {
      const inputMarkerFindOneWithLatLngDto: MarkerFindOneWithLatLngDto = {
        partyID: 'Party01',
        lat: 35.8668,
        lng: 128.6015,
      };

      const expectedMarker: Marker = mockMarker;

      jest.spyOn(mockMarkerRepository, 'findOne').mockResolvedValue(expectedMarker);

      const result: Marker = await markerService.findOneWithLatLng({
        markerFindOneWithLatLngDto: inputMarkerFindOneWithLatLngDto,
      });

      expect(result).toEqual(expectedMarker);
      expect(mockMarkerRepository.findOne).toHaveBeenCalledWith({
        where: {
          lat: inputMarkerFindOneWithLatLngDto.lat,
          lng: inputMarkerFindOneWithLatLngDto.lng,
          party: { id: inputMarkerFindOneWithLatLngDto.partyID },
        },
      });
    });
  });

  describe('create', () => {
    const inputMarkerCreateDto: MarkerCreateDto = {
      partyID: 'Party01',
      name: '미진삼겹살',
      address: '대구 달서구 월성동 1195-1',
      lat: 35.8668,
      lng: 128.6015,
    };
    const expectedMarker: Marker = mockMarker;

    it('partyID, lat, lng와 일치하는 마커를 반환한다.', async () => {
      jest.spyOn(markerService, 'findOneWithLatLng').mockResolvedValue(undefined);
      jest.spyOn(mockMarkerRepository, 'save').mockResolvedValue(expectedMarker);

      const result: Marker = await markerService.create({
        markerCreateDto: inputMarkerCreateDto,
      });

      expect(result).toEqual(expectedMarker);
      expect(mockMarkerRepository.save).toHaveBeenCalledWith({
        ...inputMarkerCreateDto,
        party: { id: inputMarkerCreateDto.partyID },
      });
    });

    it('이미 저장된 주소이면 ConflictException 에러를 발생시킨다.', async () => {
      jest.spyOn(markerService, 'findOneWithLatLng').mockResolvedValue(expectedMarker);

      try {
        await markerService.create({ markerCreateDto: inputMarkerCreateDto });
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
      }
    });
  });

  describe('delete', () => {
    const inputMarkerDeleteDto: MarkerDeleteDto = {
      partyID: 'Party01',
      lat: 35.8668,
      lng: 128.6015,
    };
    const expectedMarker: Marker = mockMarker;

    it('partyID, lat, lng와 일치하는 마커를 삭제한다.', async () => {
      jest.spyOn(markerService, 'findOneWithLatLng').mockResolvedValue(expectedMarker);
      jest.spyOn(mockMarkerRepository, 'delete').mockResolvedValue({ affected: 1 });

      const result: void = await markerService.delete({
        markerDeleteDto: inputMarkerDeleteDto,
      });

      expect(result).toBeUndefined();
      expect(mockMarkerRepository.delete).toHaveBeenCalledWith({
        id: mockMarker.id,
      });
    });

    it('저장되지 않은 주소이면 ConflictException 에러를 발생시킨다.', async () => {
      jest.spyOn(markerService, 'findOneWithLatLng').mockResolvedValue(undefined);

      try {
        await markerService.delete({ markerDeleteDto: inputMarkerDeleteDto });
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
      }
    });
  });
});
