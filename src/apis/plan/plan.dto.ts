import { ApiProperty } from '@nestjs/swagger';

export class PlanCreateDto {
  @ApiProperty({ example: 'PT001', description: 'plan이 속할 party의 id' })
  partyID: string;

  @ApiProperty({ example: '삼겹살 먹방', description: 'plan명' })
  name: string;

  @ApiProperty({ example: '미진삼겹살', description: '약속 장소' })
  place: string;

  @ApiProperty({ example: '2023-11-11T19:30', description: '약속 날짜와 시간' })
  date: string;

  @ApiProperty({ example: '5000', description: '벌금' })
  fine: number;

  @ApiProperty({ example: '1회', description: '벌금 타입' })
  fineType: string;

  @ApiProperty({
    example: '대구 달서구 월성동 1195-1',
    description: '약속 장소의 주소',
  })
  placeAddress: string;

  @ApiProperty({ example: '35.8668', description: '약속 장소의 위도' })
  placeLat: number;

  @ApiProperty({ example: '128.6015', description: '약속 장소의 경도' })
  placeLng: number;
}
