import { Module } from '@nestjs/common';
import { PlanController } from './plan.controller';
import { PlanService } from './plan.service';
import { Plan } from './plan.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapService } from '../map/map.service';
import { UserService } from '../user/user.service';
import { Party } from '../party/party.entity';
import { User } from '../user/user.entity';
import { PartyService } from '../party/party.service';
import { Party_UserService } from '../party-user/party-user.service';
import { Party_User } from '../party-user/party-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Map,
      Plan,
      Party,
      User,
      Party_User, //
    ]),
  ],
  controllers: [
    PlanController, //
  ],
  providers: [
    MapService,
    PlanService,
    PartyService,
    UserService,
    Party_UserService, //
  ],
})
export class PlanModule {}
