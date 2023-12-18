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
import { User_PointModule } from './apis/user-point/user-point.module';
import { ChatModule } from './apis/chat/chat.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MarkerModule } from './apis/marker/marker.module';
import { Party_PointModule } from './apis/party-point/party-point.module';
import { User_LocationModule } from './apis/user-location/user-location.module';

@Module({
  imports: [
    AuthModule,
    ChatModule,
    FileModule,
    FriendModule,
    MarkerModule,
    UserModule,
    User_LocationModule,
    User_PointModule,
    Party_PointModule,
    PartyModule,
    Party_UserModule,
    PlanModule,
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE as 'mysql',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE,
      entities: [__dirname + '/apis/**/*.entity.*'],
      synchronize: false,
      logging: false,
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
