import { Controller, Get, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { AnalyticsService } from '~/modules/analytics/analytics.service'
import { AprioriResponseDto } from '~/modules/analytics/dto/apriori.dto'
import { ClassificationResponseDto } from '~/modules/analytics/dto/classification.dto'
import { EdaResponseDto } from '~/modules/analytics/dto/eda.dto'
import { KmeansResponseDto } from '~/modules/analytics/dto/kmeans.dto'

@ApiTags('Analytics')
@UseGuards(AuthGuard('jwt'))
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('eda')
  @ApiOperation({ summary: 'Get exploratory data analysis results' })
  @ApiOkResponse({ description: 'EDA analytics payload', type: EdaResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getEda(): Promise<EdaResponseDto> {
    return this.analyticsService.getEda()
  }

  @Get('apriori')
  @ApiOperation({ summary: 'Get Apriori association rules results' })
  @ApiOkResponse({ description: 'Apriori analytics payload', type: AprioriResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getApriori(): Promise<AprioriResponseDto> {
    return this.analyticsService.getApriori()
  }

  @Get('kmeans')
  @ApiOperation({ summary: 'Get K-Means clustering results' })
  @ApiOkResponse({ description: 'K-Means analytics payload', type: KmeansResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getKmeans(): Promise<KmeansResponseDto> {
    return this.analyticsService.getKmeans()
  }

  @Get('classification')
  @ApiOperation({ summary: 'Get conversion classification results' })
  @ApiOkResponse({ description: 'Classification analytics payload', type: ClassificationResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getClassification(): Promise<ClassificationResponseDto> {
    return this.analyticsService.getClassification()
  }
}
