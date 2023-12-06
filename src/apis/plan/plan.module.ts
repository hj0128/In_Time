import { Module } from '@nestjs/common';
import { PlanController } from './plan.controller';
import { PlanService } from './plan.service';
import { Plan } from './plan.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { Party_UserModule } from '../party-user/party-user.module';
import { PointModule } from '../point/point.module';

@Module({
  imports: [
    UserModule,
    Party_UserModule,
    PointModule,
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
