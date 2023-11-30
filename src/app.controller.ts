import { Controller, Get, Render } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class AppController {
  @ApiExcludeEndpoint()
  @Get('/home_unauth')
  @Render('home_unauth')
  homeUnAuth() {
    return { APP_KEY: process.env.KAKAO_APP_KEY };
  }

  @ApiExcludeEndpoint()
  @Get('/')
  @Render('home')
  home() {
    return { APP_KEY: process.env.KAKAO_APP_KEY };
  }

  @ApiExcludeEndpoint()
  @Get('/mypage')
  @Render('mypage')
  mypage() {}

  @ApiExcludeEndpoint()
  @Get('/point')
  @Render('point')
  point() {}

  @ApiExcludeEndpoint()
  @Get('/party')
  @Render('party')
  party() {
    return { APP_KEY: process.env.KAKAO_APP_KEY };
  }

  @ApiExcludeEndpoint()
  @Get('/party/list')
  @Render('party_list')
  partyList() {}

  @ApiExcludeEndpoint()
  @Get('/party/create')
  @Render('party_create')
  partyCreate() {}

  @ApiExcludeEndpoint()
  @Get('/plan')
  @Render('plan')
  plan() {
    return { APP_KEY: process.env.KAKAO_APP_KEY };
  }

  @ApiExcludeEndpoint()
  @Get('/plan/create')
  @Render('plan_create')
  planCreate() {
    return { APP_KEY: process.env.KAKAO_APP_KEY };
  }

  @ApiExcludeEndpoint()
  @Get('/friend/list')
  @Render('friend_list')
  friendList() {}

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
