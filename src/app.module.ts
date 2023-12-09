import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartyModule } from './apis/party/party.module';
import { PlanModule } from './apis/plan/plan.module';
import { UserModule } from './apis/user/user.module';
import { AuthModule } from './apis/auth/auth.module';
import { APP_PIPE } from '@nestjs/core';
import { FriendModule } from './apis/friend/friend.module';
import { Party_UserModule } from './apis/party-user/party-user.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import { FileModule } from './apis/file/file.module';
import { PointModule } from './apis/point/point.module';
import { ChatModule } from './apis/chat/chat.module';

@Module({
  imports: [
    AuthModule,
    ChatModule,
    FileModule,
    FriendModule,
    UserModule,
    PointModule,
    PartyModule,
    Party_UserModule,
    PlanModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE as 'mysql',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE,
      entities: [__dirname + '/apis/**/*.entity.*'],
      synchronize: true, // 개발 중에만 사용, 프로덕션에서는 비활성화
      logging: true,
    }),
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      url: 'redis://my_redis:6379',
      isGlobal: true,
    }),
  ],
  controllers: [
    AppController, //
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
