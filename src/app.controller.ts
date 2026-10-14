import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
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
  async health(): Promise<HealthCheckResponseDto> {
    return this.appService.health()
  }
}
