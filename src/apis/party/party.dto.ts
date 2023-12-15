import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class FindOneWithPartyIDDto {
  partyID: string;
}

export class PartyCreateDto {
  @ApiProperty({ example: '동아리 모임', description: 'party명' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '["User01", "User02"]', description: '각 user의 id' })
  @IsString()
  @IsNotEmpty()
  friendsID: string;
}

export class PartyUpdateAndUserAndPlanDto {
  @ApiProperty({ example: 'Plan01', description: 'plan의 id' })
  @IsString()
  @IsNotEmpty()
  planID: string;

  @ApiProperty({ example: 'Party1', description: 'party의 id' })
  @IsString()
  @IsNotEmpty()
  partyID: string;

  @ApiProperty({ example: ['철수', '유리'], description: '지각한 user의 name' })
  @IsArray()
  @IsNotEmpty()
  users: string[];
}

export class PartySoftDeleteDto {
  @ApiProperty({ example: 'Party01', description: 'party의 id' })
  @IsString()
  @IsNotEmpty()
  partyID: string;
}

export class PartyDeleteDto {
  @ApiProperty({ example: 'Party01', description: 'party의 id' })
  @IsString()
  @IsNotEmpty()
  partyID: string;
}
