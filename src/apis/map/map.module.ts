import { Module } from '@nestjs/common';
import { MapController } from './map.controller';
import { MapService } from './map.service';
import { Map } from './map.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartyService } from '../party/party.service';
import { UserService } from '../user/user.service';
import { Party } from '../party/party.entity';
import { User } from '../user/user.entity';
import { Party_UserService } from '../party-user/party-user.service';
import { Party_User } from '../party-user/party-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Map,
      Party,
      User,
      Party_User, //
    ]),
  ],
  controllers: [
    MapController, //
  ],
  providers: [
    MapService,
    PartyService,
    UserService,
    Party_UserService, //
  ],
})
export class MapModule {}
