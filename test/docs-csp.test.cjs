const assert = require('node:assert/strict')
const { after, before, describe, it } = require('node:test')
const { Test } = require('@nestjs/testing')
const helmet = require('helmet')
const request = require('supertest')
const { configureDocumentation } = require('../dist/common/configure-documentation')

for (const nodeEnv of ['development', 'staging', 'test', undefined, 'production']) {
  describe(`Docs CSP (${nodeEnv})`, () => {
    let app

    before(async () => {
      const module = await Test.createTestingModule({}).compile()
      app = module.createNestApplication()
      app.use(helmet())
      app.use('/api/ping', (_req, res) => res.json({ status: 'OK' }))
      configureDocumentation(app, nodeEnv)
      await app.init()
    })

    after(async () => {
      await app.close()
    })

    it('keeps the API CSP strict', async () => {
      const response = await request(app.getHttpServer()).get('/api/ping').expect(200)
      assert.match(response.headers['content-security-policy'], /script-src 'self';/)
      assert.doesNotMatch(response.headers['content-security-policy'], /cdn\.jsdelivr\.net/)
      assert.equal(response.headers['x-content-type-options'], 'nosniff')
    })

    it('only allows Scalar scripts on non-production docs', async () => {
      const response = await request(app.getHttpServer())
        .get('/docs')
        .expect(nodeEnv === 'production' ? 404 : 200)
      const csp = response.headers['content-security-policy']

      if (nodeEnv === 'production') {
        assert.match(csp, /script-src 'self';/)
        await request(app.getHttpServer()).get('/swagger').expect(404)
        await request(app.getHttpServer()).get('/swagger-json').expect(404)
      } else {
        assert.match(csp, /script-src 'self' https:\/\/cdn\.jsdelivr\.net 'unsafe-inline';/)
        assert.match(csp, /script-src-attr 'none'/)
        assert.ok(response.text.includes('https://cdn.jsdelivr.net/npm/@scalar/api-reference'))
        assert.ok(response.text.includes('Scalar.createApiReference'))
        assert.equal(response.headers['x-content-type-options'], 'nosniff')
        await request(app.getHttpServer()).get('/docs/').expect(200)
        const schema = await request(app.getHttpServer()).get('/swagger-json').expect(200)
        assert.match(schema.headers['content-security-policy'], /script-src 'self';/)
      }
    })

    it('does not apply the exception to similar route names', async () => {
      const response = await request(app.getHttpServer()).get('/docs-other').expect(404)
      assert.match(response.headers['content-security-policy'], /script-src 'self';/)
    })
  })
}
