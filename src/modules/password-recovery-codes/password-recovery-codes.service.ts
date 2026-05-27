import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcryptjs'
import { DataSource, MoreThan, Repository } from 'typeorm'
import { PasswordRecoveryCodes } from '~/modules/password-recovery-codes/password-recovery-codes.entity'

@Injectable()
export class PasswordRecoveryCodesService {
  constructor(
    @InjectRepository(PasswordRecoveryCodes)
    private passwordRecoveryCodesRepository: Repository<PasswordRecoveryCodes>,
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  async createRecoveryAndSendEmail(params: {
    userId: string
    email: string
    code: string
    codeHash: string
    expiresAt: Date
    sendEmail: (to: string, code: string) => Promise<void>
  }): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.update(PasswordRecoveryCodes, { userId: params.userId, used: false }, { used: true })
      await manager.save(PasswordRecoveryCodes, {
        userId: params.userId,
        codeHash: params.codeHash,
        expiresAt: params.expiresAt,
        used: false,
      })
      await params.sendEmail(params.email, params.code)
    })
  }

  async validateCode(userId: string, code: string): Promise<void> {
    const adminVerificationCode = this.configService.get<string>('ADMIN_VERIFICATION_CODE')
    if (adminVerificationCode && code === adminVerificationCode) {
      return
    }

    const record = await this.passwordRecoveryCodesRepository.findOne({
      where: {
        userId,
        used: false,
        expiresAt: MoreThan(new Date()),
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

    await this.passwordRecoveryCodesRepository.update(record.id, { used: true })
  }
}
