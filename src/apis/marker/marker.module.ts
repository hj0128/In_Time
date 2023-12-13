import { Module } from '@nestjs/common';
import { MarkerController } from './marker.controller';
import { MarkerService } from './marker.service';
import { Marker } from './marker.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Marker, //
    ]),
  ],
  controllers: [
    MarkerController, //
  ],
  providers: [
    MarkerService, //
  ],
  exports: [
    MarkerService, //
  ],
})
export class MarkerModule {}
