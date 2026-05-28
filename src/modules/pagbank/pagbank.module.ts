import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PagBankService } from '~/modules/pagbank/pagbank.service'
import { PagBankController } from '~/modules/pagbank/pagbank.controller'

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('PAGBANK_API_URL'),
        timeout: 10_000,
        headers: {
          Authorization: `Bearer ${configService.get<string>('PAGBANK_TOKEN')}`,
          'Content-Type': 'application/json',
        },
      }),
    }),
  ],
  providers: [PagBankService],
  exports: [PagBankService],
  controllers: [PagBankController],
})
export class PagBankModule {}
