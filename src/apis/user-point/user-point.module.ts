import { Module, forwardRef } from '@nestjs/common';
import { User_PointController } from './user-point.controller';
import { User_PointService } from './user-point.service';
import { User_Point } from './user-point.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { IamPortService } from '../iam-port/iam-port.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([
      User_Point, //
    ]),
  ],
  controllers: [
    User_PointController, //
  ],
  providers: [
    User_PointService,
    IamPortService, //
  ],
  exports: [
    User_PointService, //
  ],
})
export class User_PointModule {}
