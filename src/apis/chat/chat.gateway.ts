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
  // WebSocket 서버의 인스턴스
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  // 연결된 클라이언트, 클라이언트 닉네임 및 방에 있는 사용자를 추적
  connectedClients: { [socketId: string]: boolean } = {};
  clientNickname: { [socketId: string]: string } = {};
  roomUsers: { [key: string]: string[] } = {};

  // 클라이언트가 연결될 때 호출되는 메서드
  handleConnection(client: Socket): void {
    if (this.connectedClients[client.id]) {
      client.disconnect(true);
      return;
    }

    this.connectedClients[client.id] = true;
  }

  // 클라이언트가 연결을 해제할 때 호출되는 메서드
  handleDisconnect(client: Socket): void {
    // 연결이 끊긴 클라이언트를 목록에서 제거
    delete this.connectedClients[client.id];

    // 클라이언트 연결이 종료되면 해당 클라이언트가 속한 모든 방에서 유저를 제거
    // 클라이언트가 속한 모든 방에서 유저를 제거하고 해당 정보를 방에 알림
    Object.keys(this.roomUsers).forEach((room) => {
      const index = this.roomUsers[room]?.indexOf(this.clientNickname[client.id]);
      if (index !== -1) {
        this.roomUsers[room].splice(index, 1);
        this.server.to(room).emit('userLeft', { userId: this.clientNickname[client.id], room });
        this.server.to(room).emit('userList', { room, userList: this.roomUsers[room] });
      }
    });

    // 모든 방의 유저 목록을 업데이트하여 emit
    Object.keys(this.roomUsers).forEach((room) => {
      this.server.to(room).emit('userList', { room, userList: this.roomUsers[room] });
    });

    // 연결된 클라이언트 목록을 업데이트하여 emit
    this.server.emit('userList', {
      room: null,
      userList: Object.keys(this.connectedClients),
    });
  }

  // // 클라이언트의 room을 삭제하는 메서드 안되는디
  // @SubscribeMessage('delete')
  // async deleteRoom(room: string): Promise<void> {
  //   console.log('==========romuser1');
  //   console.log(this.roomUsers);
  //   console.log(this.roomUsers[room]);
  //   console.log('==========romuser1');
  //   // 방이 존재하면 방을 삭제하고 해당 정보를 방에 알림
  //   if (this.roomUsers[room]) {
  //     // 해당 방에 속한 모든 유저를 제거하고 방 정보를 알림
  //     this.roomUsers[room].forEach((user) => {
  //       const client = this.server.sockets.sockets[user];
  //       if (client) {
  //         client.leave(room);
  //         client.emit('userLeft', { userId: this.clientNickname[client.id], room });
  //         client.emit('userList', { room, userList: this.roomUsers[room] });
  //       }
  //     });

  //     // 해당 방을 삭제
  //     delete this.roomUsers[room];
  //     console.log('==========romuser2');
  //     console.log(this.roomUsers);
  //     console.log(this.roomUsers[room]);
  //     console.log('==========romuser2');
  //     // 모든 방의 유저 목록을 업데이트하여 emit
  //     Object.keys(this.roomUsers).forEach((r) => {
  //       this.server.to(r).emit('userList', { room: r, userList: this.roomUsers[r] });
  //     });
  //   }
  // }

  // // 클라이언트의 닉네임을 설정하는 메서드
  //   @SubscribeMessage('setUserNick')
  //   handleSetUserNick(client: Socket, nick: string): void {
  //     this.clientNickname[client.id] = nick;
  //   }

  // 채팅 방에 참여하는 메서드
  @SubscribeMessage('join')
  async handleJoin(client: Socket, data: { room: string }): Promise<void> {
    // 이미 접속한 방인지 확인
    if (client.rooms.has(data.room)) {
      return;
    }

    client.join(data.room);

    // 방에 유저 목록이 없으면 초기화
    if (!this.roomUsers[data.room]) {
      this.roomUsers[data.room] = [];
    }

    // 채팅 기록 가져오기
    const history = await this.chatService.getHistory({ chatGetHistory: { room: data.room } });

    // 유저를 방에 추가하고 해당 정보를 방에 알림
    this.roomUsers[data.room].push(this.clientNickname[client.id]);
    this.server
      .to(data.room)
      .emit('userJoined', { userId: this.clientNickname[client.id], room: data.room });
    this.server
      .to(data.room)
      .emit('userList', { room: data.room, userList: this.roomUsers[data.room] });
    this.server.to(data.room).emit('chatHistory', { room: data.room, history });

    // 전체 연결된 클라이언트 목록을 업데이트하여 emit
    this.server.emit('userList', {
      room: null,
      userList: Object.keys(this.connectedClients),
    });
  }

  // 채팅 방에서 나가는 메서드
  @SubscribeMessage('exit')
  handleExit(client: Socket, room: string): void {
    // 방에 접속되어 있지 않은 경우는 무시
    if (!client.rooms.has(room)) {
      return;
    }

    client.leave(room);

    // 방에서 유저를 제거하고 해당 정보를 방에 알림
    const index = this.roomUsers[room]?.indexOf(this.clientNickname[client.id]);
    if (index !== -1) {
      this.roomUsers[room].splice(index, 1);
      this.server.to(room).emit('userLeft', { userId: this.clientNickname[client.id], room });
      this.server.to(room).emit('userList', { room, userList: this.roomUsers[room] });
    }

    // 모든 방의 유저 목록을 업데이트하여 emit
    Object.keys(this.roomUsers).forEach((room) => {
      this.server.to(room).emit('userList', { room, userList: this.roomUsers[room] });
    });

    // 연결된 클라이언트 목록을 업데이트하여 emit
    this.server.emit('userList', {
      room: null,
      userList: Object.keys(this.connectedClients),
    });
  }

  // 클라이언트에서 'getUserList' 메시지를 받으면 호출되는 메서드
  @SubscribeMessage('getUserList')
  handleGetUserList(client: Socket, room: string): void {
    // 해당 방에 속한 사용자 목록을 방송하여 클라이언트에게 전달
    this.server.to(room).emit('userList', { room, userList: this.roomUsers[room] });
  }

  // 클라이언트에서 'chatMessage' 메시지를 받으면 호출되는 메서드
  @SubscribeMessage('chatMessage')
  async handleChatMessage(client: Socket, data: { message: string; room: string }): Promise<void> {
    console.log('========hey======');
    console.log(data.message, data.room);
    if (!this.roomUsers[data.room]) {
      console.log('방없쪄');
      return;
    }

    // 클라이언트가 보낸 토큰을 확인하고, 유효하지 않다면 예외를 던짐
    const token = client.handshake.query.token as string;

    try {
      jwt.verify(token, process.env.JWT_ACCESS_KEY);
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    // 토큰에서 추출된 정보를 사용자 닉네임으로 설정
    const payload = this.jwtService.decode(token);
    this.clientNickname[client.id] = payload.name;

    // 클라이언트가 보낸 채팅 메시지를 해당 방으로 전달
    this.server.to(data.room).emit('chatMessage', {
      userName: this.clientNickname[client.id],
      message: data.message,
      room: data.room,
    });

    // 채팅 메시지를 데이터베이스에 저장
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
