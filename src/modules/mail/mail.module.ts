import { MailerModule } from '@nestjs-modules/mailer'
import { Module } from '@nestjs/common'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter'
import { MailService } from '~/modules/mail/mail.service'
import { join } from 'path'
import { ConfigService } from '@nestjs/config'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const emailUser = configService.get<string>('EMAIL_USER')
        const emailPass = configService.get<string>('EMAIL_PASS')
        if (!emailUser || !emailPass) {
          throw new Error('EMAIL_USER and EMAIL_PASS must be configured')
        }

        return {
          transport: {
            host: 'smtp.resend.com',
            port: 2465,
            secure: true,
            auth: {
              user: 'resend',
              pass: emailPass,
            },
          },
          defaults: {
            from: `"Corevent" <${emailUser}>`,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: { strict: true },
          },
        }
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
