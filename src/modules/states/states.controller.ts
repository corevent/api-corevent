import { Controller, Get, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ResponseStateDto } from '~/modules/states/dto/states.dto'
import { StatesService } from '~/modules/states/states.service'

@ApiTags('States')
@UseGuards(AuthGuard('jwt'))
@Controller('states')
export class StatesController {
  constructor(private readonly statesService: StatesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all states' })
  @ApiResponse({ status: 200, description: 'The list of states', type: ResponseStateDto })
  async getAll(): Promise<ResponseStateDto> {
    return this.statesService.getAll()
  }
}
