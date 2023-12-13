import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MarkerFindOneWithLatLngDto {
  @ApiProperty({ example: '35.8668', description: '장소 위도' })
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @ApiProperty({ example: '128.6015', description: '장소 경도' })
  @IsNumber()
  @IsNotEmpty()
  lng: number;

  @ApiProperty({ example: 'Party01', description: 'party의 id' })
  @IsString()
  @IsNotEmpty()
  partyID: string;
}

export class MarkerCreateDto {
  @ApiProperty({ example: '미진삼겹살', description: '장소 이름' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '대구 달서구 월성동 1195-1', description: '장소 주소' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: '35.8668', description: '장소 위도' })
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @ApiProperty({ example: '128.6015', description: '장소 경도' })
  @IsNumber()
  @IsNotEmpty()
  lng: number;

  @ApiProperty({ example: 'Party01', description: 'party의 id' })
  @IsString()
  @IsNotEmpty()
  partyID: string;
}

export class MarkerDeleteDto {
  @ApiProperty({ example: '35.8668', description: '장소 위도' })
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @ApiProperty({ example: '128.6015', description: '장소 경도' })
  @IsNumber()
  @IsNotEmpty()
  lng: number;

  @ApiProperty({ example: 'Party01', description: 'party의 id' })
  @IsString()
  @IsNotEmpty()
  partyID: string;
}
