import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

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
}
