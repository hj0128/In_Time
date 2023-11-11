import { Body, Controller, Get, Post, Query, Redirect, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { User } from './user.entity';
import { UserCreateDto } from './user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@ApiTags('User')
@Controller('/user')
export class UserController {
  constructor(
    private readonly userService: UserService, //
  ) {}

  @UseGuards(AuthGuard('access'))
  @Get('/test')
  test(
    @Req() req: Request, //
  ) {
    return req.user;
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
  async userCreate(
    @Body() userCreateDto: UserCreateDto, //
  ): Promise<User> {
    return this.userService.create({ userCreateDto });
  }
}
