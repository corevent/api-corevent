import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { CitiesService } from '~/modules/cities/cities.service'
import { CityResponseDto } from '~/modules/cities/dto/cities.dto'

@ApiTags('Cities')
@UseGuards(AuthGuard('jwt'))
@Controller('states')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get(':stateId/cities')
  @ApiOperation({ summary: 'Get all cities by state ID' })
  @ApiOkResponse({ description: 'The list of cities', type: CityResponseDto })
  @ApiBadRequestResponse({ description: 'Wrong state ID' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getAllByStateId(@Param('stateId') stateId: number): Promise<CityResponseDto> {
    return this.citiesService.getAllByStateId(stateId)
  }
}
