import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { User_LocationService } from './user-location.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { JwtReqUser } from 'src/commons/interface/req.interface';
import { UserLocationCreateDto } from './user-location.dto';
import { User_Location } from './user-location.entity';
import { UserLocationInfo } from './user-location.interface';

@ApiTags('User_Location')
@Controller('/userLocation')
export class User_LocationController {
  constructor(
    private readonly userLocationService: User_LocationService, //
  ) {}

  @ApiOperation({
    summary: 'user 위치 정보 저장하기',
    description: 'user의 위치 정보를 DB에 저장한다.',
  })
  @UseGuards(AuthGuard('access'))
  @Post('/userLocationCreate')
  userLocationCreate(
    @Req() req: Request & JwtReqUser,
    @Body() userLocationCreateDto: UserLocationCreateDto, //
  ): Promise<User_Location> {
    return this.userLocationService.create({ user: req.user, userLocationCreateDto });
  }

  @ApiOperation({
    summary: 'user들 위치 정보 가져오기',
    description: 'DB에서 userName과 일치하는 user의 위치 정보를 가져온다.',
  })
  @UseGuards(AuthGuard('access'))
  @Get('/userLocationFindWithUsersName')
  userLocationFindWithUsersName(
    @Query() query: { usersName: string[]; planID: string }, //
  ): Promise<UserLocationInfo[]> {
    return this.userLocationService.findWithUsersName({
      usersName: query.usersName,
      planID: query.planID,
    });
  }
}
