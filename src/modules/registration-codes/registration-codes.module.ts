import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RegistrationCodes } from '~/modules/registration-codes/registration-codes.entity'
import { RegistrationCodesService } from '~/modules/registration-codes/registration-codes.service'

@Module({
  imports: [TypeOrmModule.forFeature([RegistrationCodes])],
  providers: [RegistrationCodesService],
  exports: [RegistrationCodesService],
})
export class RegistrationCodesModule {}
