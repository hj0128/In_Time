import { Body, Controller, Delete, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PartyService } from './party.service';
import { Party } from './party.entity';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  FindOneWithPartyIDDto,
  PartyCreateDto,
  PartyDeleteDto,
  PartySoftDeleteDto,
  PartyUpdateAndUserAndPlanDto,
} from './party.dto';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { JwtReqUser } from '../../commons/interface/req.interface';
import { PartyList } from './party.interface';

@ApiTags('Party')
@Controller('/party')
export class PartyController {
  constructor(
    private readonly partyService: PartyService, //
  ) {}

  @ApiOperation({
    summary: '로그인 user의 모든 party 가져오기',
    description: '로그인 유저의 모든 party를 배열로 가져온다.',
  })
  @UseGuards(AuthGuard('access'))
  @Get('/partyFindAll')
  partyFindAll(
    @Req() req: Request & JwtReqUser, //
  ): Promise<PartyList[]> {
    return this.partyService.findWithUserID({ userID: req.user.id });
  }

  @ApiOperation({
    summary: 'partyID와 일치하는 party 가져오기',
    description: 'partyID와 일치하는 party를 가져온다.',
  })
  @UseGuards(AuthGuard('access'))
  @Get('/partyFindOneWithPartyID')
  partyFindOneWithPartyID(
    @Query() findOneWithPartyIDDto: FindOneWithPartyIDDto, //
  ): Promise<Party> {
    return this.partyService.findOneWithPartyID({ partyID: findOneWithPartyIDDto.partyID });
  }

  @ApiOperation({
    summary: 'party 생성하기',
    description: '로그인 유저의 party를 생성하여 DB에 저장한다.',
  })
  @UseGuards(AuthGuard('access'))
  @Post('/partyCreate')
  partyCreate(
    @Body() partyCreateDto: PartyCreateDto,
    @Req() req: Request & JwtReqUser, //
  ): Promise<Party> {
    return this.partyService.create({ partyCreateDto, user: req.user });
  }

  @ApiOperation({
    summary: 'party, user, plan 업데이트하기',
    description: '약속 시간이 끝난 후 party, user, plan을 업데이트한다.',
  })
  @UseGuards(AuthGuard('access'))
  @Post('/partyUpdateAndUserAndPlan')
  partyUpdateAndUserAndPlan(
    @Body() partyUpdateAndUserAndPlanDto: PartyUpdateAndUserAndPlanDto, //
  ): Promise<void> {
    return this.partyService.updateAndUserAndPlan({ partyUpdateAndUserAndPlanDto });
  }

  @ApiOperation({
    summary: '파티 소프트 삭제',
    description: '파티를 소프트 삭제한다.',
  })
  @UseGuards(AuthGuard('access'))
  @Delete('/partySoftDelete')
  partySoftDelete(
    @Body() partySoftDeleteDto: PartySoftDeleteDto, //
  ): Promise<boolean> {
    return this.partyService.softDelete({ partySoftDeleteDto });
  }

  @ApiOperation({
    summary: '파티 하드 삭제하기',
    description: '파티를 DB에서 완전히 삭제한다.',
  })
  @Delete('/partyDelete')
  partyDelete(
    @Body() partyDeleteDto: PartyDeleteDto, //
  ): Promise<boolean> {
    return this.partyService.delete({ partyDeleteDto });
  }
}
