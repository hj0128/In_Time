import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Map } from './map.entity';
import { Repository } from 'typeorm';
import { PartyService } from '../party/party.service';
import { UserService } from '../user/user.service';

@Injectable()
export class MapService {
  constructor(
    @InjectRepository(Map)
    private readonly mapRepository: Repository<Map>,

    private readonly partyService: PartyService,
    private readonly userService: UserService, //
  ) {}

  async create({ placeName, placeAddress, placeLat, placeLng, partyID, plan }) {
    // 유저 찾기
    const party = await this.partyService.findOneWithPartyID({ partyID });
    console.log(typeof placeLng);
    // const members = party.members;
    // 각 유저마다 배열에 넣기
    console.log(placeLat);
    // this.userService.findOneWithUserId({ id: party.members });

    // this.mapRepository.save({
    //   placeName,
    //   placeAddress,
    //   placeLat,
    //   placeLng,
    // });
  }
}
