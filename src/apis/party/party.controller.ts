import { Body, Controller, Delete, Get, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { PartyService } from './party.service';
import { Party } from './party.entity';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  FindOneWithPartyIDDto,
  PartyCreateDto,
  PartyDeleteDto,
  PartyRestoreDto,
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

  @Get('/test')
  test() {
    return this.partyService.findOneWithPartyID({
      partyID: '3fa35122-abb0-49c2-a251-1775f8d6b265',
    });
  }

  @UseGuards(AuthGuard('access'))
  @ApiOperation({
    summary: '로그인 user의 모든 party 가져오기',
    description: '로그인 유저의 모든 party를 배열로 가져온다.',
  })
  @Get('/partyFindAll')
  partyFindAll(
    @Req() req: Request & JwtReqUser, //
  ): Promise<PartyList[]> {
    return this.partyService.findWithUserID({ userID: req.user.id });
  }

  @UseGuards(AuthGuard('access'))
  @ApiOperation({
    summary: 'partyID와 일치하는 party 가져오기',
    description: 'partyID와 일치하는 party를 가져온다.',
  })
  @Get('/partyFindOneWithPartyID')
  partyFindOneWithPartyID(
    @Query() findOneWithPartyIDDto: FindOneWithPartyIDDto, //
  ): Promise<Party> {
    return this.partyService.findOneWithPartyID({ partyID: findOneWithPartyIDDto.partyID });
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

  @UseGuards(AuthGuard('access'))
  @ApiOperation({
    summary: 'party, user, plan 업데이트하기',
    description: '약속 시간이 끝난 후 party, user, plan을 업데이트한다.',
  })
  @Post('/partyUpdateAndUserAndPlan')
  partyUpdateAndUserAndPlan(
    @Body() partyUpdateAndUserAndPlanDto: PartyUpdateAndUserAndPlanDto, //
  ): Promise<void> {
    return this.partyService.updateAndUserAndPlan({ partyUpdateAndUserAndPlanDto });
  }

  @UseGuards(AuthGuard('access'))
  @ApiOperation({
    summary: '파티 삭제',
    description: '파티를 삭제한다.',
  })
  @Delete('/partyDelete')
  partyDelete(
    @Query() partyDeleteDto: PartyDeleteDto, //
  ): Promise<boolean> {
    return this.partyService.delete({ partyDeleteDto });
  }

  @UseGuards(AuthGuard('access'))
  @ApiOperation({
    summary: '파티 복구',
    description: '삭제된 파티를 복구한다.',
  })
  @Put('/partyRestore')
  partyRestore(
    @Body() partyRestoreDto: PartyRestoreDto, //
  ): Promise<boolean> {
    return this.partyService.restore({ partyRestoreDto });
  }
}
