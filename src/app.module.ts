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

@Module({
  imports: [
    AuthModule,
    FileModule,
    FriendModule,
    UserModule,
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
      synchronize: true,
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
