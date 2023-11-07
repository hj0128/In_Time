import { Body, Controller, Get, Post } from '@nestjs/common';
import { PartyService } from './party.service';

@Controller('/party')
export class PartyController {
  constructor(
    private readonly partyService: PartyService, //
  ) {}
  
  @Get('/get_party_list')
  findAll() {
    return this.partyService.findAll();
  }

  @Post('/create_party')
  create(
    @Body('name') name,
    @Body('members') members, //
  ) {
    return this.partyService.create({ name, members });
  }
}
