import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PartyCreateDto {
  @ApiProperty({ example: '동아리 모임', description: 'party명' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '["U001", "U002"]', description: '각 user의 id' })
  @IsString()
  @IsNotEmpty()
  friendsID: string;
}
