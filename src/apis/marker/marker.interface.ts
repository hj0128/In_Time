import { MarkerCreateDto, MarkerDeleteDto, MarkerFindOneWithLatLngDto } from './marker.dto';

export interface IMarkerServiceFindAllWithPartyID {
  partyID: string;
}

export interface IMarkerServiceFindOneWithLatLng {
  markerFindOneWithLatLngDto: MarkerFindOneWithLatLngDto;
}

export interface IMarkerServiceCreate {
  markerCreateDto: MarkerCreateDto;
}

export interface IMarkerServiceDelete {
  markerDeleteDto: MarkerDeleteDto;
}
