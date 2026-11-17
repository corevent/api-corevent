import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
import helmet from 'helmet'

export function configureDocumentation(app: INestApplication, nodeEnv?: string): void {
  if (nodeEnv === 'production') return

  const config = new DocumentBuilder()
    .setTitle('API Corevent')
    .setDescription('Event management system')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('swagger', app, document)
  app.use(
    '/docs',
    // Scalar loads its bundle from jsDelivr and initializes it with an inline script.
    helmet.contentSecurityPolicy({
      directives: {
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net', "'unsafe-inline'"],
      },
    }),
    apiReference({ content: document }),
  )
}
