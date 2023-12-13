import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { User_PointService } from './user-point.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { JwtReqUser } from 'src/commons/interface/req.interface';
import { PointFillDto, PointSendDto } from './user-point.dto';
import { User_Point } from './user-point.entity';

@ApiTags('User_Point')
@Controller('/userPoint')
export class User_PointController {
  constructor(
    private readonly userPointService: User_PointService, //
  ) {}

  @ApiOperation({
    summary: 'userID로 point 내역 찾기',
    description: '해당하는 userID의 point 내역을 찾는다.',
  })
  @ApiQuery({ name: 'userID', description: '찾고 싶은 user의 id' })
  @Get('/userPointFindWithUserID')
  userPointFindWithUserID(
    @Query('userID') userID: string, //
  ): Promise<User_Point[]> {
    return this.userPointService.findWithUserID({ userID });
  }

  @UseGuards(AuthGuard('access'))
  @ApiOperation({
    summary: '유저의 포인트를 충전한다.',
    description: 'user의 포인트를 충전한다.',
  })
  @Post('/userPointFill')
  userPointFill(
    @Req() req: Request & JwtReqUser,
    @Body() pointFillDto: PointFillDto, //
  ): Promise<User_Point> {
    return this.userPointService.fill({ user: req.user, pointFillDto });
  }

  @UseGuards(AuthGuard('access'))
  @ApiOperation({
    summary: '유저의 포인트를 보낸다.',
    description: 'user의 포인트를 보낸다.',
  })
  @Post('/userPointSend')
  userPointSend(
    @Req() req: Request & JwtReqUser,
    @Body() pointSendDto: PointSendDto, //
  ): Promise<User_Point> {
    return this.userPointService.send({ user: req.user, pointSendDto });
  }
}
