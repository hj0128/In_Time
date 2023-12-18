import { Module } from '@nestjs/common';
import { User_LocationController } from './user-location.controller';
import { User_LocationService } from './user-location.service';
import { User_Location } from './user-location.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User_Location, //
    ]),
  ],
  controllers: [
    User_LocationController, //
  ],
  providers: [
    User_LocationService, //
  ],
  exports: [
    User_LocationService, //
  ],
})
export class User_LocationModule {}
