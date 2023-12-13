import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileModule } from '../file/file.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { Party_UserModule } from '../party-user/party-user.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    FileModule,
    Party_UserModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      User, //
    ]),
  ],
  controllers: [
    UserController, //
  ],
  providers: [
    UserService, //
  ],
  exports: [
    UserService, //
  ],
})
export class UserModule {}
