import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './chat.entity';
import { AuthModule } from '../auth/auth.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Chat, //
    ]),
  ],
  providers: [
    ChatService,
    ChatGateway,
    JwtService, //
  ],
  exports: [
    ChatService, //
  ],
})
export class ChatModule {}
