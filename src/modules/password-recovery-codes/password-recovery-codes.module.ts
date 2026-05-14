import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PasswordRecoveryCodes } from '~/modules/password-recovery-codes/password-recovery-codes.entity'
import { PasswordRecoveryCodesService } from '~/modules/password-recovery-codes/password-recovery-codes.service'
import { UsersModule } from '~/modules/users/users.module'

@Module({
  imports: [TypeOrmModule.forFeature([PasswordRecoveryCodes]), UsersModule],
  providers: [PasswordRecoveryCodesService],
  exports: [PasswordRecoveryCodesService],
})
export class PasswordRecoveryCodesModule {}
