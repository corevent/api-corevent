import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AnalyticsController } from '~/modules/analytics/analytics.controller'
import { AnalyticsService } from '~/modules/analytics/analytics.service'
import {
  ANALYTICS_ARTIFACTS_READER,
  ConfigurableAnalyticsArtifactsReader,
} from '~/modules/analytics/analytics-artifacts.reader'
import { storageClientProvider } from '~/modules/storage/storage.client'

@Module({
  imports: [ConfigModule],
  controllers: [AnalyticsController],
  providers: [
    storageClientProvider,
    AnalyticsService,
    {
      provide: ANALYTICS_ARTIFACTS_READER,
      useClass: ConfigurableAnalyticsArtifactsReader,
    },
  ],
})
export class AnalyticsModule {}
