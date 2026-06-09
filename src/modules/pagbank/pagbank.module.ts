import { HttpModule } from '@nestjs/axios'
import { Module, forwardRef } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { OrdersModule } from '~/modules/orders/orders.module'
import { PagBankWebhookService } from '~/modules/pagbank/pagbank-webhook.service'
import { PagBankController } from '~/modules/pagbank/pagbank.controller'
import { PagBankService } from '~/modules/pagbank/pagbank.service'

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
    forwardRef(() => OrdersModule),
  ],
  providers: [PagBankService, PagBankWebhookService],
  exports: [PagBankService],
  controllers: [PagBankController],
})
export class PagBankModule {}
