import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'

@Injectable()
export class MailService {
  private readonly connectionCheckTimeoutMs = 5_000

  constructor(private mailerService: MailerService) {}

  async checkConnection(): Promise<'OK' | 'error'> {
    try {
      const isConnected = await this.verifyWithinTimeout()
      return isConnected ? 'OK' : 'error'
    } catch {
      return 'error'
    }
  }

  async sendRecoveryCode(to: string, code: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Código de recuperação de senha',
      template: 'reset-code',
      context: {
        code,
      },
    })
  }

  async sendVerifyEmailCode(to: string, code: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Código de verificação de email',
      template: 'verify-email',
      context: {
        code,
      },
    })
  }

  async inviteStaff(to: string, organizerName: string, eventName: string) {
    await this.mailerService.sendMail({
      to,
      subject: `Convite para ser um staff no evento ${eventName}`,
      template: 'invite-staff',
      context: { organizerName, eventName },
    })
  }

  private verifyWithinTimeout(): Promise<boolean> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('SMTP verification timed out')), this.connectionCheckTimeoutMs)
    })

    return Promise.race([this.mailerService.verifyAllTransporters(), timeout]).finally(() => {
      clearTimeout(timeoutId)
    })
  }
}
