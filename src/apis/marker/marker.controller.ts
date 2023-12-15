import { Body, Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common';
import { MarkerService } from './marker.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MarkerCreateDto, MarkerDeleteDto } from './marker.dto';
import { Marker } from './marker.entity';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Marker')
@Controller('/marker')
export class MarkerController {
  constructor(
    private readonly markerService: MarkerService, //
  ) {}

  @ApiOperation({
    summary: 'partyId와 일치하는 marker 찾기',
    description: '해당 party의 marker를 찾는다.',
  })
  @ApiQuery({ name: 'Party01', description: '찾고 싶은 party의 id' })
  @UseGuards(AuthGuard('access'))
  @Get('/markerFindAllWithPartyID')
  markerFindAllWithPartyID(
    @Query('partyID') partyID: string, //
  ): Promise<Marker[]> {
    return this.markerService.findAllWithPartyID({ partyID });
  }

  @ApiOperation({
    summary: 'marker 등록하기',
    description: 'party에서 등록한 marker를 DB에 저장한다.',
  })
  @UseGuards(AuthGuard('access'))
  @Post('/markerCreate')
  markerCreate(
    @Body() markerCreateDto: MarkerCreateDto, //
  ): Promise<Marker> {
    return this.markerService.create({ markerCreateDto });
  }

  @ApiOperation({
    summary: 'marker 삭제하기',
    description: 'party에 등록된 marker를 삭제한다.',
  })
  @UseGuards(AuthGuard('access'))
  @Delete('/markerDelete')
  markerDelete(
    @Body() markerDeleteDto: MarkerDeleteDto, //
  ): Promise<void> {
    return this.markerService.delete({ markerDeleteDto });
  }
}
