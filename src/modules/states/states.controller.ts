import { Controller, Get, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { StateResponseDto } from '~/modules/states/dto/states.dto'
import { StatesService } from '~/modules/states/states.service'

@ApiTags('States')
@UseGuards(AuthGuard('jwt'))
@Controller('states')
export class StatesController {
  constructor(private readonly statesService: StatesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all states' })
  @ApiOkResponse({ description: 'The list of states', type: StateResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getAll(): Promise<StateResponseDto> {
    return this.statesService.getAll()
  }
}
