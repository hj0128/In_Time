import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  connectedClients: { [socketId: string]: boolean } = {};
  clientNickname: { [socketId: string]: string } = {};
  roomUsers: { [key: string]: string[] } = {};

  handleConnection(client: Socket): void {
    if (this.connectedClients[client.id]) {
      client.disconnect(true);
      return;
    }

    this.connectedClients[client.id] = true;
  }

  handleDisconnect(client: Socket): void {
    delete this.connectedClients[client.id];

    Object.keys(this.roomUsers).forEach((room) => {
      const index = this.roomUsers[room]?.indexOf(this.clientNickname[client.id]);
      if (index !== -1) {
        this.roomUsers[room].splice(index, 1);
        this.server.to(room).emit('userLeft', { userId: this.clientNickname[client.id], room });
        this.server.to(room).emit('userList', { room, userList: this.roomUsers[room] });
      }
    });

    Object.keys(this.roomUsers).forEach((room) => {
      this.server.to(room).emit('userList', { room, userList: this.roomUsers[room] });
    });

    this.server.emit('userList', {
      room: null,
      userList: Object.keys(this.connectedClients),
    });
  }

  @SubscribeMessage('join')
  async handleJoin(client: Socket, data: { room: string }): Promise<void> {
    if (client.rooms.has(data.room)) {
      return;
    }

    client.join(data.room);

    if (!this.roomUsers[data.room]) {
      this.roomUsers[data.room] = [];
    }

    const history = await this.chatService.getHistory({ chatGetHistory: { room: data.room } });

    this.roomUsers[data.room].push(this.clientNickname[client.id]);
    this.server
      .to(data.room)
      .emit('userJoined', { userId: this.clientNickname[client.id], room: data.room });
    this.server
      .to(data.room)
      .emit('userList', { room: data.room, userList: this.roomUsers[data.room] });
    this.server.to(data.room).emit('chatHistory', { room: data.room, history });

    this.server.emit('userList', {
      room: null,
      userList: Object.keys(this.connectedClients),
    });
  }

  @SubscribeMessage('exit')
  handleExit(client: Socket, room: string): void {
    if (!client.rooms.has(room)) {
      return;
    }

    client.leave(room);

    const index = this.roomUsers[room]?.indexOf(this.clientNickname[client.id]);
    if (index !== -1) {
      this.roomUsers[room].splice(index, 1);
      this.server.to(room).emit('userLeft', { userId: this.clientNickname[client.id], room });
      this.server.to(room).emit('userList', { room, userList: this.roomUsers[room] });
    }

    Object.keys(this.roomUsers).forEach((room) => {
      this.server.to(room).emit('userList', { room, userList: this.roomUsers[room] });
    });

    this.server.emit('userList', {
      room: null,
      userList: Object.keys(this.connectedClients),
    });
  }

  @SubscribeMessage('getUserList')
  handleGetUserList(client: Socket, room: string): void {
    this.server.to(room).emit('userList', { room, userList: this.roomUsers[room] });
  }

  @SubscribeMessage('chatMessage')
  async handleChatMessage(client: Socket, data: { message: string; room: string }): Promise<void> {
    if (!this.roomUsers[data.room]) {
      return;
    }

    const token = client.handshake.query.token as string;

    try {
      jwt.verify(token, process.env.JWT_ACCESS_KEY);
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    const payload = this.jwtService.decode(token);
    this.clientNickname[client.id] = payload.name;

    this.server.to(data.room).emit('chatMessage', {
      userName: this.clientNickname[client.id],
      message: data.message,
      room: data.room,
    });

    await this.chatService.saveMessage({
      chatSaveMessageDto: {
        userName: payload.name,
        message: data.message,
        room: data.room,
        partyID: data.room,
      },
    });
  }
}
