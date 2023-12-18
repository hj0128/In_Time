import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PointFillDto {
  @ApiProperty({ example: 'imp_1947448', description: '결제 ID' })
  @IsString()
  @IsNotEmpty()
  impUid: string;

  @ApiProperty({ example: '5000', description: '결제 금액' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

export class PointSendDto {
  @ApiProperty({ example: '5000', description: '보낼 금액' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

export class PointFineDto {
  @ApiProperty({ example: '철수', description: 'user의 name' })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({ example: 'Party01', description: 'party의 id' })
  @IsString()
  @IsNotEmpty()
  partyID: string;

  @ApiProperty({ example: '5000', description: '벌금으로 낼 금액' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
