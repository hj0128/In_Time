import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Party_User } from './party-user.entity';
import { Party_UserController } from './party-user.controller';
import { Party_UserService } from './party-user.service';
import { PartyModule } from '../party/party.module';

@Module({
  imports: [
    forwardRef(() => PartyModule),
    TypeOrmModule.forFeature([
      Party_User, //
    ]),
  ],
  controllers: [
    Party_UserController, //
  ],
  providers: [
    Party_UserService, //
  ],
  exports: [
    Party_UserService, //
  ],
})
export class Party_UserModule {}
