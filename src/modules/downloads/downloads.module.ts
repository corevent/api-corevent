import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DownloadsController } from '~/modules/downloads/downloads.controller'
import { DownloadsService } from '~/modules/downloads/downloads.service'
import { storageClientProvider } from '~/modules/storage/storage.client'

@Module({
  imports: [ConfigModule],
  controllers: [DownloadsController],
  providers: [storageClientProvider, DownloadsService],
})
export class DownloadsModule {}
