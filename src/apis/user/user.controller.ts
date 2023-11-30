import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { User } from './user.entity';
import { UserCreateDto, UserSetRedisDto } from './user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { JwtReqUser } from 'src/commons/interface/req.interface';
import { RedisInfo } from './user.interface';

@ApiTags('User')
@Controller('/user')
export class UserController {
  constructor(
    private readonly userService: UserService, //
  ) {}

  // 지우기
  @UseGuards(AuthGuard('access'))
  @ApiOperation({
    summary: 'TEST',
    description: 'test',
  })
  @Get('/test')
  test(
    @Req() req: Request & JwtReqUser, //
  ) {
    return req.user;
  }

  @UseGuards(AuthGuard('access'))
  @ApiOperation({
    summary: 'userID로 user 찾기',
    description: '해당하는 userID의 user를 찾는다.',
  })
  @ApiQuery({ name: 'userID', description: '찾고 싶은 user의 ID' })
  @Get('/userFindOneWithUserID')
  userFindOneWithUserID(
    @Req() req: Request & JwtReqUser, //
  ): Promise<User> {
    return this.userService.findOneWithUserID({ id: req.user.id });
  }

  @ApiOperation({
    summary: 'name으로 user 찾기',
    description: '해당하는 name의 user를 찾는다.',
  })
  @ApiQuery({ name: 'name', description: '찾고 싶은 user의 name' })
  @Get('/userFindOneWithName')
  userFindOneWithName(
    @Query('name') name: string, //
  ): Promise<User> {
    return this.userService.findOneWithName({ name });
  }

  @ApiOperation({
    summary: 'email으로 user 찾기',
    description: '해당하는 email의 user를 찾는다.',
  })
  @ApiQuery({ name: 'email', description: '찾고 싶은 user의 email' })
  @Get('/userFindOneWithEmail')
  userFindOneWithEmail(
    @Query('email') email: string, //
  ): Promise<User> {
    return this.userService.findOneWithEmail({ email });
  }

  @ApiOperation({
    summary: 'user 등록하기',
    description: '회원 가입에 성공하면 user를 DB에 생성한다.',
  })
  @Post('/userCreate')
  userCreate(
    @Body() userCreateDto: UserCreateDto, //
  ): Promise<User> {
    return this.userService.create({ userCreateDto });
  }

  @UseGuards(AuthGuard('access'))
  @ApiOperation({
    summary: 'Redis에 user 등록하기',
    description: 'Redis에 user의 실시간 위치를 저장한다.',
  })
  @Post('/userSetRedis')
  userSetRedis(
    @Req() req: Request & JwtReqUser,
    @Body() userSetRedisDto: UserSetRedisDto, //
  ): Promise<UserSetRedisDto> {
    return this.userService.setRedis({ user: req.user, userSetRedisDto });
  }

  @UseGuards(AuthGuard('access'))
  @ApiOperation({
    summary: 'Redis에서 user들 가져오기',
    description: 'Redis에서 userName과 일치하는 값을 가져온다.',
  })
  @Get('/userGetRedis')
  userGetRedis(
    @Query('usersName') usersName: string[], //
  ): Promise<RedisInfo[]> {
    return this.userService.getRedis({ usersName });
  }
}
