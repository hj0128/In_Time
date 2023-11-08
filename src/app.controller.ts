import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService, //
  ) {}

  @ApiExcludeEndpoint()
  @Get('/')
  @Render('home')
  home() {}

  @ApiExcludeEndpoint()
  @Get('/party')
  @Render('party')
  party() {}

  @ApiExcludeEndpoint()
  @Get('/party/list')
  @Render('party_list')
  partyList() {}

  @ApiExcludeEndpoint()
  @Get('/party/create')
  @Render('party_create')
  createParty() {}

  @ApiExcludeEndpoint()
  @Get('/plan')
  @Render('plan')
  plan() {}

  @ApiExcludeEndpoint()
  @Get('/plan/create')
  @Render('plan_create')
  createPlan() {}

  @ApiExcludeEndpoint()
  @Get('/friend')
  @Render('friend')
  friend() {}

  @ApiExcludeEndpoint()
  @Get('/friend/create')
  @Render('friend_create')
  createFriend() {}

  @ApiExcludeEndpoint()
  @Get('/map')
  @Render('map')
  map() {}
}
