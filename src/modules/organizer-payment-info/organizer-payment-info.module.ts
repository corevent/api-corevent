import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrganizerPaymentInfoController } from '~/modules/organizer-payment-info/organizer-payment-info.controller'
import { OrganizerPaymentInfo } from '~/modules/organizer-payment-info/organizer-payment-info.entity'
import { OrganizerPaymentInfoService } from '~/modules/organizer-payment-info/organizer-payment-info.service'
import { UsersModule } from '~/modules/users/users.module'

@Module({
  imports: [TypeOrmModule.forFeature([OrganizerPaymentInfo]), UsersModule],
  controllers: [OrganizerPaymentInfoController],
  providers: [OrganizerPaymentInfoService],
  exports: [OrganizerPaymentInfoService],
})
export class OrganizerPaymentInfoModule {}
