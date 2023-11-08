import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PlanService } from './plan.service';
import { Plan } from './plan.entity';
import { PlanCreateDto } from './plan.dto';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Plan')
@Controller('/plan')
export class PlanController {
  constructor(
    private readonly planService: PlanService, //
  ) {}

  @ApiOperation({
    summary: '하나의 plan 가져오기',
    description: 'plan id에 해당하는 plan을 가져온다.',
  })
  @ApiQuery({ name: 'planID', description: '찾고 싶은 plan의 id' })
  @Get('/planFindOneWithPlanID')
  planFindOneWithPlanID(
    @Query('planID') planID: string, //
  ): Promise<Plan> {
    return this.planService.findOneWithPlanID({ planID });
  }

  @ApiOperation({
    summary: '모든 plan 가져오기',
    description: 'party id의 모든 plan을 가져온다.',
  })
  @ApiQuery({ name: 'partyID', description: '찾고 싶은 party의 id' })
  @Get('/planFindWithPartyID')
  planFindWithPartyID(
    @Query('partyID') partyID: string, //
  ): Promise<Plan[]> {
    return this.planService.findWithPartyID({ partyID });
  }

  @ApiOperation({
    summary: 'plan 생성하기',
    description: 'plan을 생성하여 DB에 저장한다.',
  })
  @Post('/planCreate')
  planCreate(
    @Body() planCreateDto: PlanCreateDto, //
  ): Promise<Plan> {
    return this.planService.create({ planCreateDto });
  }
}
