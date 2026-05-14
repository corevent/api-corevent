import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PasswordRecoveryCode } from '~/modules/password-recovery-codes/interfaces/password-recovery-codes.interface'
import { PasswordRecoveryCodes } from '~/modules/password-recovery-codes/password-recovery-codes.entity'
import { UsersService } from '~/modules/users/users.service'
import * as bcrypt from 'bcryptjs'
import { Users } from '~/modules/users/users.entity'

@Injectable()
export class PasswordRecoveryCodesService {
  constructor(
    @InjectRepository(PasswordRecoveryCodes)
    private passwordRecoveryCodesRepository: Repository<PasswordRecoveryCodes>,
    private usersService: UsersService,
  ) {}

  async createRecoveryCode(body: PasswordRecoveryCode): Promise<void> {
    const passwordRecoveryCode = this.passwordRecoveryCodesRepository.create(body)
    await this.passwordRecoveryCodesRepository.save(passwordRecoveryCode)
  }

  async validateCode(user: Users, code: string): Promise<void> {
    const record = await this.passwordRecoveryCodesRepository.findOne({
      where: {
        userId: user.id,
        used: false,
      },
      order: { createdAt: 'DESC' },
    })

    if (!record) throw new BadRequestException('Invalid code')

    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Code expired')
    }

    const isCodeValid = await bcrypt.compare(code, record.codeHash)
    if (!isCodeValid) {
      record.attempts++
      if (record.attempts >= 5) {
        await this.passwordRecoveryCodesRepository.update(record.id, { attempts: record.attempts, used: true })
        throw new BadRequestException('Code expired due to maximum attempts reached')
      }

      await this.passwordRecoveryCodesRepository.update(record.id, { attempts: record.attempts })
      throw new BadRequestException(`Invalid code, ${5 - record.attempts} attempts left`)
    }
  }

  async invalidateOldCodes(userId: string): Promise<void> {
    await this.passwordRecoveryCodesRepository.update({ userId, used: false }, { used: true })
  }
}
