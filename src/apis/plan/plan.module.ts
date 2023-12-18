import { Module } from '@nestjs/common';
import { PlanController } from './plan.controller';
import { PlanService } from './plan.service';
import { Plan } from './plan.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { Party_UserModule } from '../party-user/party-user.module';
import { User_PointModule } from '../user-point/user-point.module';

@Module({
  imports: [
    UserModule,
    Party_UserModule,
    User_PointModule,
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
  exports: [
    PlanService, //
  ],
})
export class PlanModule {}
