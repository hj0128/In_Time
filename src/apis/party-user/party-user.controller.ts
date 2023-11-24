import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Party_UserService } from './party-user.service';
import { Party_User } from './party-user.entity';

@ApiTags('Party_User')
@Controller('/party_user')
export class Party_UserController {
  constructor(
    private readonly partyUserService: Party_UserService, //
  ) {}

  @UseGuards(AuthGuard('access'))
  @ApiOperation({
    summary: '해당 party의 모든 user 정보 가져오기',
    description: 'partyID에 연결된 user의 정보를 모두 가져온다.',
  })
  @ApiQuery({ name: 'partyID', description: '찾고 싶은 party의 id' })
  @Get('/partyUserFindAllWithPartyID')
  partyUserFindAllWithPartyID(
    @Query('partyID') partyID: string, //
  ): Promise<Party_User[]> {
    return this.partyUserService.findAllWithPartyID({ partyID });
  }
}
