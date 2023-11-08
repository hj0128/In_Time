import { Module } from '@nestjs/common';
import { PlanController } from './plan.controller';
import { PlanService } from './plan.service';
import { Plan } from './plan.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
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
