import { Module } from '@nestjs/common';
import { PartyController } from './party.controller';
import { PartyService } from './party.service';
import { Party } from './party.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { Party_UserModule } from '../party-user/party-user.module';

@Module({
  imports: [
    UserModule,
    Party_UserModule,
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
  exports: [
    PartyService, //
  ],
})
export class PartyModule {}
