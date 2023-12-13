import { Module, forwardRef } from '@nestjs/common';
import { PartyController } from './party.controller';
import { PartyService } from './party.service';
import { Party } from './party.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Party_UserModule } from '../party-user/party-user.module';
import { PlanModule } from '../plan/plan.module';
import { User_PointModule } from '../user_point/user-point.module';

@Module({
  imports: [
    forwardRef(() => Party_UserModule),
    User_PointModule,
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
