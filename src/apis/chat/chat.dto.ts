import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChatSaveMessageDto {
  @ApiProperty({ example: '철수', description: 'user의 별명' })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({ example: 'hello', description: 'message 내용' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: 'Party01', description: 'room 번호' })
  @IsString()
  @IsNotEmpty()
  room: string;

  @ApiProperty({ example: 'Party01', description: '채팅한 party의 id' })
  @IsString()
  @IsNotEmpty()
  partyID: string;
}

export class ChatGetHistory {
  @ApiProperty({ example: 'Party01', description: 'room 번호' })
  @IsString()
  @IsNotEmpty()
  room: string;
}
