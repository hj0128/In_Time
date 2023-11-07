import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  @Render('home')
  home() {
    return;
  }

  @Get('/party')
  @Render('party')
  party() {
    return;
  }

  @Get('/party/create_party')
  @Render('create_party')
  create_party() {
    return;
  }

  @Get('/friend')
  @Render('friend')
  friend() {
    return;
  }

  @Get('/create_friend')
  @Render('create_friend')
  create_friend() {
    return;
  }

  @Get('/map')
  @Render('map')
  map() {
    return;
  }
}
