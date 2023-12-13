import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PartyPointUserSendDto {
  @ApiProperty({ example: 'Party01', description: 'party의 id' })
  @IsString()
  @IsNotEmpty()
  partyID: string;

  @ApiProperty({ example: '5000', description: '벌금으로 낼 금액' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
