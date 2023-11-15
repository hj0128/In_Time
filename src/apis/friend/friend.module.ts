import { Module } from '@nestjs/common';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';
import { Friend } from './friend.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Friend,
      User, //
    ]),
  ],
  controllers: [
    FriendController, //
  ],
  providers: [
    FriendService,
    UserService, //
  ],
})
export class FriendModule {}
