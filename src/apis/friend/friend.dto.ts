import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FriendCreateDto {
  @ApiProperty({ example: '철수', description: '요청을 보낼 친구의 별명' })
  @IsString()
  @IsNotEmpty()
  toUserName: string;
}

export class FriendUpdateDto {
  @ApiProperty({ example: 'Fr001', description: '내가 수락한 friend의 ID' })
  @IsString()
  @IsNotEmpty()
  friendID: string;

  @ApiProperty({ example: 'Ft001', description: '나에게 요청을 보낸 user의 ID' })
  @IsString()
  @IsNotEmpty()
  fromUserID: string;
}

export class FriendDeleteDto {
  @ApiProperty({ example: 'Fr001', description: '삭제할 요청 friend의 ID' })
  @IsString()
  @IsNotEmpty()
  friendID: string;
}
