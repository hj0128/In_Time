import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthSendTokenDto {
  @ApiProperty({ example: '785623', description: '생성한 토큰 번호' })
  @IsString()
  @IsNotEmpty()
  tokenNumber: string;

  @ApiProperty({ example: '010', description: '휴대폰 앞 번호' })
  @IsString()
  @IsNotEmpty()
  phone1: string;

  @ApiProperty({ example: '1234', description: '휴대폰 중간 번호' })
  @IsString()
  @IsNotEmpty()
  phone2: string;

  @ApiProperty({ example: '5678', description: '휴대폰 마지막 번호' })
  @IsString()
  @IsNotEmpty()
  phone3: string;
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
