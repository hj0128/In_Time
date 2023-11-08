import { Body, Controller, Get, Post } from '@nestjs/common';
import { PartyService } from './party.service';
import { Party } from './party.entity';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PartyCreateDto } from './party.dto';

@ApiTags('Party')
@Controller('/party')
export class PartyController {
  constructor(
    private readonly partyService: PartyService, //
  ) {}

  @ApiOperation({
    summary: '모든 party 가져오기',
    description: '모든 party를 배열로 가져온다.',
  })
  @Get('/partyFindAll')
  partyFindAll(): Promise<Party[]> {
    return this.partyService.findAll();
  }

  @ApiOperation({
    summary: 'party 생성하기',
    description: 'party를 생성하여 DB에 저장한다.',
  })
  @Post('/partyCreate')
  partyCreate(
    @Body() partyCreateDto: PartyCreateDto, //
  ): Promise<Party> {
    return this.partyService.create({ partyCreateDto });
  }
}
