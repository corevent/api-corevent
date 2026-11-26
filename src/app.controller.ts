import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiServiceUnavailableResponse } from '@nestjs/swagger'
import { SkipThrottle } from '@nestjs/throttler'
import { AppService } from '~/app.service'
import { HealthCheckResponseDto } from '~/dto/app.dto'

@SkipThrottle()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check the API and its dependencies' })
  @ApiOkResponse({ type: HealthCheckResponseDto, description: 'API and dependencies are healthy' })
  @ApiServiceUnavailableResponse({
    type: HealthCheckResponseDto,
    description: 'One or more dependencies are unhealthy',
  })
  async health(): Promise<HealthCheckResponseDto> {
    const result = await this.appService.health()
    if (result.status !== 'OK') {
      throw new HttpException(result, HttpStatus.SERVICE_UNAVAILABLE)
    }
    return result
  }
}
