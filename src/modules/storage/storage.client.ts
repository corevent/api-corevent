import { Storage } from '@google-cloud/storage'
import { Provider } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export const STORAGE_CLIENT = 'STORAGE_CLIENT'

export const storageClientProvider: Provider = {
  provide: STORAGE_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): Storage => {
    const keyFilename = configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS')
    return keyFilename ? new Storage({ keyFilename }) : new Storage()
  },
}
