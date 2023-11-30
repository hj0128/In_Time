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
