import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtGoogleStrategy } from './strategies/jwt-social-google.strategy';
import { JwtNaverStrategy } from './strategies/jwt-social-naver.strategy';
import { JwtKakaoStrategy } from './strategies/jwt-social-kakao.strategy';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      User, //
    ]),
  ],
  controllers: [
    AuthController, //
  ],
  providers: [
    AuthService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    JwtGoogleStrategy,
    JwtNaverStrategy,
    JwtKakaoStrategy,
    UserService, //
  ],
})
export class AuthModule {}
