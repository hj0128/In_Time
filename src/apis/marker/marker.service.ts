import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Marker } from './marker.entity';
import { Repository } from 'typeorm';
import {
  IMarkerServiceCreate,
  IMarkerServiceDelete,
  IMarkerServiceFindAllWithPartyID,
  IMarkerServiceFindOneWithLatLng,
} from './marker.interface';

@Injectable()
export class MarkerService {
  constructor(
    @InjectRepository(Marker)
    private readonly markerRepository: Repository<Marker>, //
  ) {}

  findAllWithPartyID({ partyID }: IMarkerServiceFindAllWithPartyID): Promise<Marker[]> {
    return this.markerRepository.find({ where: { party: { id: partyID } } });
  }

  findOneWithLatLng({
    markerFindOneWithLatLngDto,
  }: IMarkerServiceFindOneWithLatLng): Promise<Marker> {
    const { lat, lng, partyID } = markerFindOneWithLatLngDto;

    return this.markerRepository.findOne({
      where: { lat, lng, party: { id: partyID } },
    });
  }

  async create({ markerCreateDto }: IMarkerServiceCreate): Promise<Marker> {
    const { lat, lng, partyID } = markerCreateDto;

    const existingMarker = await this.findOneWithLatLng({
      markerFindOneWithLatLngDto: { lat, lng, partyID },
    });
    if (existingMarker) throw new ConflictException('이미 저장된 주소입니다.');

    const create = await this.markerRepository.save({
      ...markerCreateDto,
      party: { id: partyID },
    });
    if (!create) throw new InternalServerErrorException('마커를 저장하지 못하였습니다.');

    return create;
  }

  async delete({ markerDeleteDto }: IMarkerServiceDelete): Promise<void> {
    const { lat, lng, partyID } = markerDeleteDto;

    const existingMarker = await this.findOneWithLatLng({
      markerFindOneWithLatLngDto: { lat, lng, partyID },
    });
    if (!existingMarker) throw new ConflictException('저장되지 않은 주소입니다.');

    await this.markerRepository.delete({ id: existingMarker.id });
  }
}
