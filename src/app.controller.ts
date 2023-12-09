import { Controller, Get, Render } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class AppController {
  @ApiExcludeEndpoint()
  @Get('/chat')
  @Render('chat')
  chat() {}

  @ApiExcludeEndpoint()
  @Get('/')
  @Render('home')
  home() {
    return { KAKAO_APP_KEY: process.env.KAKAO_APP_KEY };
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
    return { KAKAO_APP_KEY: process.env.KAKAO_APP_KEY };
  }

  @ApiExcludeEndpoint()
  @Get('/party/create')
  @Render('party_create')
  partyCreate() {}

  @ApiExcludeEndpoint()
  @Get('/plan')
  @Render('plan')
  plan() {
    return { KAKAO_APP_KEY: process.env.KAKAO_APP_KEY };
  }

  @ApiExcludeEndpoint()
  @Get('/plan/create')
  @Render('plan_create')
  planCreate() {
    return { KAKAO_APP_KEY: process.env.KAKAO_APP_KEY };
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
