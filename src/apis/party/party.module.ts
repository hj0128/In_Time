import { Module } from '@nestjs/common';
import { PartyController } from './party.controller';
import { PartyService } from './party.service';
import { Party } from './party.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Party_UserModule } from '../party-user/party-user.module';
import { PlanModule } from '../plan/plan.module';
import { PointModule } from '../point/point.module';

@Module({
  imports: [
    PointModule,
    Party_UserModule,
    PlanModule,
    TypeOrmModule.forFeature([
      Party, //
    ]),
  ],
  controllers: [
    PartyController, //
  ],
  providers: [
    PartyService, //
  ],
  exports: [
    PartyService, //
  ],
})
export class PartyModule {}
