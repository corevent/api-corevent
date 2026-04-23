import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrganizerPaymentInfoController } from '~/organizer-payment-info/organizer-payment-info.controller'
import { OrganizerPaymentInfo } from '~/organizer-payment-info/organizer-payment-info.entity'
import { OrganizerPaymentInfoService } from '~/organizer-payment-info/organizer-payment-info.service'

@Module({
  imports: [TypeOrmModule.forFeature([OrganizerPaymentInfo])],
  controllers: [OrganizerPaymentInfoController],
  providers: [OrganizerPaymentInfoService],
  exports: [OrganizerPaymentInfoService],
})
export class OrganizerPaymentInfoModule {}
