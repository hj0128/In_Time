import { Module } from '@nestjs/common';
import { PlanController } from './plan.controller';
import { PlanService } from './plan.service';
import { Plan } from './plan.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { Party_UserModule } from '../party-user/party-user.module';
import { PartyModule } from '../party/party.module';

@Module({
  imports: [
    UserModule,
    PartyModule,
    Party_UserModule,
    TypeOrmModule.forFeature([
      Plan, //
    ]),
  ],
  controllers: [
    PlanController, //
  ],
  providers: [
    PlanService, //
  ],
})
export class PlanModule {}
