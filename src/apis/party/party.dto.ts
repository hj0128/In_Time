import { ApiProperty } from '@nestjs/swagger';

export class PartyCreateDto {
  @ApiProperty({ example: '동아리 모임', description: 'party명' })
  name: string;

  @ApiProperty({ example: '["U001", "U002"]', description: '각 user의 id' })
  members: string;
}
