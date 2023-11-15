import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService, //
  ) {}

  @ApiExcludeEndpoint()
  @Get('/')
  @Render('home')
  home() {}

  @UseGuards(AuthGuard('access'))
  @ApiExcludeEndpoint()
  @Get('/party')
  @Render('party')
  party() {}

  @UseGuards(AuthGuard('access'))
  @ApiExcludeEndpoint()
  @Get('/party/list')
  @Render('party_list')
  partyList() {}

  @UseGuards(AuthGuard('access'))
  @ApiExcludeEndpoint()
  @Get('/party/create')
  @Render('party_create')
  partyCreate() {}

  @UseGuards(AuthGuard('access'))
  @ApiExcludeEndpoint()
  @Get('/plan')
  @Render('plan')
  plan() {}

  @UseGuards(AuthGuard('access'))
  @ApiExcludeEndpoint()
  @Get('/plan/create')
  @Render('plan_create')
  planCreate() {}

  @UseGuards(AuthGuard('access'))
  @ApiExcludeEndpoint()
  @Get('/friend/list')
  @Render('friend_list')
  friendList() {}

  @UseGuards(AuthGuard('access'))
  @ApiExcludeEndpoint()
  @Get('/friend/create')
  @Render('friend_create')
  friendCreate() {}

  @ApiExcludeEndpoint()
  @Get('/signIn')
  @Render('signIn')
  signIn() {}

  @ApiExcludeEndpoint()
  @Get('/signUp')
  @Render('signUp')
  signUp() {}

  @ApiExcludeEndpoint()
  @Get('/map')
  @Render('map')
  map() {}
}
