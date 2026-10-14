import { Module, forwardRef } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { EventsModule } from '~/modules/events-module/events.module'
import { SignedImageUrlInterceptor } from '~/modules/storage/signed-image-url.interceptor'
import { StorageController } from '~/modules/storage/storage.controller'
import { storageClientProvider } from '~/modules/storage/storage.client'
import { StorageHealthService } from '~/modules/storage/storage-health.service'
import { StorageService } from '~/modules/storage/storage.service'

@Module({
  imports: [ConfigModule, forwardRef(() => EventsModule)],
  providers: [
    storageClientProvider,
    StorageService,
    StorageHealthService,
    { provide: APP_INTERCEPTOR, useClass: SignedImageUrlInterceptor },
  ],
  exports: [StorageService, StorageHealthService],
  controllers: [StorageController],
})
export class StorageModule {}
