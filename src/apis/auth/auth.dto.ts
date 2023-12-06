import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthSendTokenDto {
  @ApiProperty({ example: '785623', description: '생성한 토큰 번호' })
  @IsString()
  @IsNotEmpty()
  tokenNumber: string;

  @ApiProperty({ example: 'a@a.com', description: '이메일 주소' })
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class AuthLoginDto {
  @ApiProperty({ example: 'a@a.com', description: '이메일 주소' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '1234', description: '비밀번호' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
