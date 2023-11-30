import { Module } from '@nestjs/common';
import { PointController } from './point.controller';
import { PointService } from './point.service';
import { Point } from './point.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { IamPortService } from '../iam-port/iam-port.service';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([
      Point, //
    ]),
  ],
  controllers: [
    PointController, //
  ],
  providers: [
    PointService,
    IamPortService, //
  ],
  exports: [
    PointService, //
  ],
})
export class PointModule {}
