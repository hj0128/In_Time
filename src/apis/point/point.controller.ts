import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PointService } from './point.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { JwtReqUser } from 'src/commons/interface/req.interface';
import { PointFillDto, PointSendDto } from './point.dto';
import { Point } from './point.entity';

@ApiTags('Point')
@Controller('/point')
export class PointController {
  constructor(
    private readonly pointService: PointService, //
  ) {}

  @ApiOperation({
    summary: 'userID로 point 내역 찾기',
    description: '해당하는 userID의 point 내역을 찾는다.',
  })
  @ApiQuery({ name: 'userID', description: '찾고 싶은 user의 id' })
  @Get('/pointFindWithUserID')
  pointFindWithUserID(
    @Query('userID') userID: string, //
  ): Promise<Point[]> {
    return this.pointService.findWithUserID({ userID });
  }

  @UseGuards(AuthGuard('access'))
  @ApiOperation({
    summary: '포인트를 충전한다.',
    description: 'user의 포인트를 충전한다.',
  })
  @Post('/pointFill')
  pointFill(
    @Req() req: Request & JwtReqUser,
    @Body() pointFillDto: PointFillDto, //
  ): Promise<Point> {
    return this.pointService.fill({ user: req.user, pointFillDto });
  }

  @UseGuards(AuthGuard('access'))
  @ApiOperation({
    summary: '포인트를 보낸다.',
    description: 'user의 포인트를 보낸다.',
  })
  @Post('/pointSend')
  pointSend(
    @Req() req: Request & JwtReqUser,
    @Body() pointSendDto: PointSendDto, //
  ) {
    return this.pointService.send({ user: req.user, pointSendDto });
  }
}
