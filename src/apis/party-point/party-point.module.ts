import { Module } from '@nestjs/common';
import { Party_PointController } from './party-point.controller';
import { Party_PointService } from './party-point.service';
import { Party_Point } from './party-point.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Party_Point, //
    ]),
  ],
  controllers: [
    Party_PointController, //
  ],
  providers: [
    Party_PointService, //
  ],
  exports: [
    Party_PointService, //
  ],
})
export class Party_PointModule {}
