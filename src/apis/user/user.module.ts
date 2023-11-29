import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileModule } from '../file/file.module';

@Module({
  imports: [
    FileModule,
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
