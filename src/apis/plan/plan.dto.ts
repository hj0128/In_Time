import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PlanCreateDto {
  @ApiProperty({ example: '삼겹살 먹방', description: 'plan명' })
  @IsString()
  @IsNotEmpty()
  planName: string;

  @ApiProperty({ example: '미진삼겹살', description: '약속 장소' })
  @IsString()
  @IsNotEmpty()
  placeName: string;

  @ApiProperty({ example: '대구 달서구 월성동 1195-1', description: '장소 주소' })
  @IsString()
  @IsNotEmpty()
  placeAddress: string;

  @ApiProperty({ example: '35.8668', description: '장소 위도' })
  @IsNumber()
  @IsNotEmpty()
  placeLat: number;

  @ApiProperty({ example: '128.6015', description: '장소 경도' })
  @IsNumber()
  @IsNotEmpty()
  placeLng: number;

  @ApiProperty({ example: '2023-11-11T19:30', description: '날짜와 시간' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '5000', description: '벌금' })
  @IsNumber()
  @IsNotEmpty()
  fine: number;

  @ApiProperty({ example: 'Party01', description: 'plan이 속할 party의 id' })
  @IsString()
  @IsNotEmpty()
  partyID: string;
}

export class PlanSoftDeleteDto {
  @ApiProperty({ example: 'Plan01', description: 'plan의 id' })
  @IsString()
  @IsNotEmpty()
  planID: string;
}
