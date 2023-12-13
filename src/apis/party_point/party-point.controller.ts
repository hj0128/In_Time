import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Party_PointService } from './party-point.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Party_Point } from './party-point.entity';
import { AuthGuard } from '@nestjs/passport';
import { JwtReqUser } from 'src/commons/interface/req.interface';
import { PartyPointUserSendDto } from './party-point.dto';

@ApiTags('Party_Point')
@Controller('/partyPoint')
export class Party_PointController {
  constructor(
    private readonly partyPointService: Party_PointService, //
  ) {}

  @ApiOperation({
    summary: 'partyID로 point 내역 찾기',
    description: '해당하는 partyID의 point 내역을 찾는다.',
  })
  @ApiQuery({ name: 'partyID', description: '찾고 싶은 party의 id' })
  @Get('/partyPointFindWithPartyID')
  partyPointFindWithPartyID(
    @Query('partyID') partyID: string, //
  ): Promise<Party_Point[]> {
    return this.partyPointService.findWithPartyID({ partyID });
  }

  @UseGuards(AuthGuard('access'))
  @ApiOperation({
    summary: '파티 포인트를 유저에게 보낸다.',
    description: 'party의 포인트를 user에게 보낸다.',
  })
  @Post('/partyPointUserSend')
  partyPointUserSend(
    @Req() req: Request & JwtReqUser,
    @Body() partyPointUserSendDto: PartyPointUserSendDto, //
  ): Promise<Party_Point> {
    return this.partyPointService.userSend({ user: req.user, partyPointUserSendDto });
  }
}
