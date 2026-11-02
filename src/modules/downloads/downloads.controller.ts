import { Controller, Get, Header, Param, ParseEnumPipe, Redirect, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Throttle, ThrottlerGuard } from '@nestjs/throttler'
import { DownloadApp } from '~/modules/downloads/download-release'
import { DownloadsService } from '~/modules/downloads/downloads.service'

@ApiTags('Downloads')
@ApiParam({ name: 'app', enum: DownloadApp })
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 60, ttl: 60000 } })
@Controller('downloads')
export class DownloadsController {
  constructor(private readonly downloads: DownloadsService) {}

  @Get(':app/latest')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Read the latest published APK for this API environment' })
  @ApiResponse({ status: 404, description: 'No APK has been published' })
  async latest(@Param('app', new ParseEnumPipe(DownloadApp)) app: DownloadApp) {
    return { data: await this.downloads.latest(app) }
  }

  @Get(':app')
  @Header('Cache-Control', 'no-store')
  @Redirect(undefined, 302)
  @ApiOperation({ summary: 'Download an APK through a signed URL valid for 15 minutes' })
  @ApiResponse({ status: 302, description: 'Redirect to the private APK object' })
  async download(@Param('app', new ParseEnumPipe(DownloadApp)) app: DownloadApp) {
    return { url: await this.downloads.download(app), statusCode: 302 }
  }
}
