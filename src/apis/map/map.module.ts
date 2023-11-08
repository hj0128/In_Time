import { Module } from '@nestjs/common';
import { MapController } from './map.controller';
import { MapService } from './map.service';
import { Map } from './map.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Map, //
    ]),
  ],
  controllers: [
    MapController, //
  ],
  providers: [
    MapService, //
  ],
})
export class MapModule {}
