import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { AppService } from '~/app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('ping')
  @ApiOperation({ summary: 'Ping the server' })
  @ApiResponse({ status: 200, description: 'Server is running' })
  getHello(): string {
    return this.appService.ping()
  }

  @Get('health')
  @ApiOperation({ summary: 'Check the database health' })
  @ApiResponse({ status: 200, description: 'Database is healthy' })
  async health(): Promise<string> {
    return this.appService.health()
  }
}
