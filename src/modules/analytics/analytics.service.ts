import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { AnalyticsAnalysis } from '~/modules/analytics/analytics-analysis'
import {
  ANALYTICS_ARTIFACTS_READER,
  AnalyticsArtifactsReader,
} from '~/modules/analytics/analytics-artifacts.reader'
import { AprioriDataDto, AprioriResponseDto } from '~/modules/analytics/dto/apriori.dto'
import {
  ClassificationDataDto,
  ClassificationResponseDto,
} from '~/modules/analytics/dto/classification.dto'
import { EdaDataDto, EdaResponseDto } from '~/modules/analytics/dto/eda.dto'
import { KmeansDataDto, KmeansResponseDto } from '~/modules/analytics/dto/kmeans.dto'

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(ANALYTICS_ARTIFACTS_READER)
    private readonly artifactsReader: AnalyticsArtifactsReader,
  ) {}

  async getEda(): Promise<EdaResponseDto> {
    return { data: await this.readAs(EdaDataDto, 'eda') }
  }

  async getApriori(): Promise<AprioriResponseDto> {
    return { data: await this.readAs(AprioriDataDto, 'apriori') }
  }

  async getKmeans(): Promise<KmeansResponseDto> {
    return { data: await this.readAs(KmeansDataDto, 'kmeans') }
  }

  async getClassification(): Promise<ClassificationResponseDto> {
    return { data: await this.readAs(ClassificationDataDto, 'classification') }
  }

  private async readAs<T>(cls: new () => T, analysis: AnalyticsAnalysis): Promise<T> {
    const payload = await this.artifactsReader.readJson(analysis)
    if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new ServiceUnavailableException(`Invalid analytics payload for ${analysis}`)
    }
    return plainToInstance(cls, payload)
  }
}
