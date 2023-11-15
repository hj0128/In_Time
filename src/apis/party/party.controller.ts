import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { PartyService } from './party.service';
import { Party } from './party.entity';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PartyCreateDto } from './party.dto';
import { Request } from 'express';
import { JwtReqUser } from '../auth/auth.interface';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Party')
@Controller('/party')
export class PartyController {
  constructor(
    private readonly partyService: PartyService, //
  ) {}

  @Get('/test')
  test() {
    return this.partyService.findOneWithPartyID({
      partyID: '3fa35122-abb0-49c2-a251-1775f8d6b265',
    });
  }

  @UseGuards(AuthGuard('access'))
  @ApiOperation({
    summary: '모든 party 가져오기',
    description: '로그인 유저의 모든 party를 배열로 가져온다.',
  })
  @Get('/partyFindAll')
  partyFindAll(
    @Req() req: Request & JwtReqUser, //
  ): Promise<Party[]> {
    return this.partyService.findAllWithUser({ user: req.user });
  }

  @UseGuards(AuthGuard('access'))
  @ApiOperation({
    summary: 'party 생성하기',
    description: '로그인 유저의 party를 생성하여 DB에 저장한다.',
  })
  @Post('/partyCreate')
  partyCreate(
    @Body() partyCreateDto: PartyCreateDto,
    @Req() req: Request & JwtReqUser, //
  ): Promise<Party> {
    return this.partyService.create({ partyCreateDto, user: req.user });
  }
}
