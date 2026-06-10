import { Module, forwardRef } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { EventsModule } from '~/modules/events-module/events.module'
import { StorageController } from '~/modules/storage/storage.controller'
import { StorageService } from '~/modules/storage/storage.service'

@Module({
  imports: [ConfigModule, forwardRef(() => EventsModule)],
  providers: [StorageService],
  exports: [StorageService],
  controllers: [StorageController],
})
export class StorageModule {}
