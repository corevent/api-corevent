import { Module, forwardRef } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { EventsModule } from '~/modules/events-module/events.module'
import { StorageController } from '~/modules/storage/storage.controller'
import { StorageHealthService } from '~/modules/storage/storage-health.service'
import { StorageService } from '~/modules/storage/storage.service'

@Module({
  imports: [ConfigModule, forwardRef(() => EventsModule)],
  providers: [StorageService, StorageHealthService],
  exports: [StorageService, StorageHealthService],
  controllers: [StorageController],
})
export class StorageModule {}
