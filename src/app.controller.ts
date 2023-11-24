import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  @ApiExcludeEndpoint()
  @Get('/')
  @Render('home')
  home() {
    return { APP_KEY: process.env.APP_KEY };
  }

  @UseGuards(AuthGuard('access'))
  @ApiExcludeEndpoint()
  @Get('/party')
  @Render('party')
  party() {
    return { APP_KEY: process.env.APP_KEY };
  }

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
  plan() {
    return { APP_KEY: process.env.APP_KEY };
  }

  @UseGuards(AuthGuard('access'))
  @ApiExcludeEndpoint()
  @Get('/plan/create')
  @Render('plan_create')
  planCreate() {
    return { APP_KEY: process.env.APP_KEY };
  }

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
}
