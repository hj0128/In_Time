import { Module } from '@nestjs/common';
import { PartyController } from './party.controller';
import { PartyService } from './party.service';
import { Party } from './party.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapService } from '../map/map.service';
import { UserService } from '../user/user.service';
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
    PartyController, //
  ],
  providers: [
    MapService,
    PartyService,
    UserService,
    Party_UserService, //
  ],
})
export class PartyModule {}
