import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UserLocationCreateDto {
  @ApiProperty({ example: '12.203', description: '위도' })
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @ApiProperty({ example: '15.205', description: '경도' })
  @IsNumber()
  @IsNotEmpty()
  lng: number;

  @ApiProperty({ example: '2023. 11. 30. 오전 11:01:46', description: '위치를 가져온 시간' })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({ example: 'true', description: 'true: 도착' })
  @IsBoolean()
  @IsNotEmpty()
  isArrive: boolean;

  @ApiProperty({ example: 'Plan01', description: 'plan의 id' })
  @IsString()
  @IsNotEmpty()
  planID: string;
}
