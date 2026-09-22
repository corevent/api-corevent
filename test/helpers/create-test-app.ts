import { ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Test, TestingModule } from '@nestjs/testing'
import { ThrottlerGuard } from '@nestjs/throttler'
import { config } from 'dotenv'
import { randomUUID } from 'node:crypto'
import { AppModule } from '~/app.module'
import { MailService } from '~/modules/mail/mail.service'
import { CheckoutResponse, CreateCheckout } from '~/modules/pagbank/interface/pagbank.interface'
import { PagBankService } from '~/modules/pagbank/pagbank.service'
import { DEFAULT_VERIFY_CODE } from './fixtures'

config()

export interface TestApp {
  app: NestExpressApplication
  mailService: {
    sendRecoveryCode: jest.Mock
    sendVerifyEmailCode: jest.Mock
    inviteStaff: jest.Mock
  }
  pagBankService: {
    createCheckout: jest.Mock
    getCheckoutById: jest.Mock
  }
}

export interface CreateTestAppOptions {
  enableThrottle?: boolean
}

function ensureEnv(name: string, fallback: string): void {
  if (!process.env[name]) {
    process.env[name] = fallback
  }
}

function applyTestEnvFallbacks(): void {
  ensureEnv('JWT_SECRET', 'e2e-jwt-secret')
  ensureEnv('JWT_REFRESH_SECRET', 'e2e-jwt-refresh-secret')
  ensureEnv('ADMIN_VERIFICATION_CODE', DEFAULT_VERIFY_CODE)
  ensureEnv('EMAIL_USER', 'test@example.com')
  ensureEnv('EMAIL_PASS', 'test-email-pass')
  ensureEnv('QR_CODE_SECRET', 'e2e-qr-code-secret-32-chars-min!')
  ensureEnv('PAGBANK_TOKEN', 'e2e-pagbank-token')
  ensureEnv('PAGBANK_REDIRECT_URL', 'https://example.com/payment/success')
  ensureEnv('PAGBANK_API_URL', 'https://pagbank.test')
  ensureEnv('AWS_ACCESS_KEY_ID', 'test-access-key')
  ensureEnv('AWS_SECRET_ACCESS_KEY', 'test-secret-key')
  ensureEnv('AWS_REGION', 'us-east-1')
  ensureEnv('AWS_S3_BUCKET', 'test-bucket')
}

function createMailMock() {
  return {
    sendRecoveryCode: jest.fn().mockResolvedValue(undefined),
    sendVerifyEmailCode: jest.fn().mockResolvedValue(undefined),
    inviteStaff: jest.fn().mockResolvedValue(undefined),
  }
}

function createPagBankMock() {
  return {
    createCheckout: jest.fn().mockImplementation((body: CreateCheckout): CheckoutResponse => {
      return {
        ...body,
        id: `CHEC_${randomUUID().toUpperCase()}`,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        additional_amount: 0,
        discount_amount: 0,
        origin: 'test',
        links: [{ rel: 'PAY', href: 'https://checkout.pagbank.test/pay', method: 'GET' }],
      }
    }),
    getCheckoutById: jest.fn().mockResolvedValue(null),
  }
}

export async function createTestApp(options: CreateTestAppOptions = {}): Promise<TestApp> {
  applyTestEnvFallbacks()

  const mailService = createMailMock()
  const pagBankService = createPagBankMock()

  const builder = Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(MailService)
    .useValue(mailService)
    .overrideProvider(PagBankService)
    .useValue(pagBankService)

  if (!options.enableThrottle) {
    builder.overrideGuard(ThrottlerGuard).useValue({ canActivate: () => true })
  }

  const moduleFixture: TestingModule = await builder.compile()
  const app = moduleFixture.createNestApplication<NestExpressApplication>({
    rawBody: true,
    logger: ['error'],
  })

  app.setGlobalPrefix('api')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Corevent')
    .setDescription('Event management system')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('swagger', app, document)

  await app.init()

  return { app, mailService, pagBankService }
}
