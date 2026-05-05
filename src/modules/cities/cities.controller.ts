import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ResponseCityDto } from '~/modules/cities/dto/cities.dto'
import { CitiesService } from '~/modules/cities/cities.service'
import { AuthGuard } from '@nestjs/passport'

@ApiTags('Cities')
@UseGuards(AuthGuard('jwt'))
@Controller('states')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get(':stateId/cities')
  @ApiOperation({ summary: 'Get all cities by state ID' })
  @ApiResponse({ status: 200, description: 'The list of cities', type: ResponseCityDto })
  @ApiResponse({ status: 400, description: 'Wrong state ID' })
  async getAllByStateId(@Param('stateId') stateId: number): Promise<ResponseCityDto> {
    return this.citiesService.getAllByStateId(stateId)
  }
}
