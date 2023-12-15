import { Body, Controller, Delete, Get, Post, Req, UseGuards } from '@nestjs/common';
import { FriendService } from './friend.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FriendCreateDto, FriendRefuseDto, FriendUnFriendDto, FriendUpdateDto } from './friend.dto';
import { Request } from 'express';
import { Friend } from './friend.entity';
import { FriendList } from './friend.interface';
import { JwtReqUser } from '../../commons/interface/req.interface';

@ApiTags('Friend')
@Controller('/friend')
export class FriendController {
  constructor(
    private readonly friendService: FriendService, //
  ) {}

  @ApiOperation({
    summary: '로그인 user의 모든 friend 가져오기',
    description: '로그인 유저의 모든 friend를 배열로 가져온다.',
  })
  @UseGuards(AuthGuard('access'))
  @Get('/friendFindWithUserID')
  friendFindWithUserID(
    @Req() req: Request & JwtReqUser, //
  ): Promise<FriendList[]> {
    return this.friendService.findWithUserID({ userID: req.user.id });
  }

  @ApiOperation({
    summary: 'friend 생성하기',
    description: '로그인 user가 친구 신청을 한다.',
  })
  @UseGuards(AuthGuard('access'))
  @Post('/friendCreate')
  friendCreate(
    @Body() friendCreateDto: FriendCreateDto,
    @Req() req: Request & JwtReqUser, //
  ): Promise<Friend> {
    return this.friendService.create({ friendCreateDto, user: req.user });
  }

  @ApiOperation({
    summary: '친구 관계 맺기',
    description: '요청을 수락할 시 서로 친구 관계로 변경한다.',
  })
  @UseGuards(AuthGuard('access'))
  @Post('/friendUpdate')
  friendUpdate(
    @Body() friendUpdateDto: FriendUpdateDto,
    @Req() req: Request & JwtReqUser, //
  ): Promise<Friend> {
    return this.friendService.update({ friendUpdateDto, user: req.user });
  }

  @ApiOperation({
    summary: '친구 요청 거절',
    description: '요청을 거절할 시 요청 내역을 삭제한다.',
  })
  @UseGuards(AuthGuard('access'))
  @Delete('/friendRefuse')
  friendRefuse(
    @Body() friendRefuseDto: FriendRefuseDto, //
  ): Promise<boolean> {
    return this.friendService.refuse({ friendRefuseDto });
  }

  @ApiOperation({
    summary: '친구 끊기',
    description: '친구 관계를 끊는다.',
  })
  @UseGuards(AuthGuard('access'))
  @Delete('/friendUnFriend')
  friendUnFriend(
    @Body() friendUnFriendDto: FriendUnFriendDto,
    @Req() req: Request & JwtReqUser, //
  ): Promise<boolean> {
    return this.friendService.unFriend({ friendUnFriendDto, userID: req.user.id });
  }
}
