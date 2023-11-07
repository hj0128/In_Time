import { Module } from '@nestjs/common';
import { PartyController } from './party.controller';
import { PartyService } from './party.service';
import { Party } from './party.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Party, //
    ]),
  ],
  controllers: [
    PartyController, //
  ],
  providers: [
    PartyService, //
  ],
})
export class PartyModule {}
