const normalizeApiBaseUrl = require('../../src/normalize-api-base-url')

describe('normalizeApiBaseUrl', () => {
  it('deve remover a barra final da URL', () => {
    expect(normalizeApiBaseUrl('https://api.corevent.site/')).toBe('https://api.corevent.site')
  })

  it('deve manter URL sem barra final', () => {
    expect(normalizeApiBaseUrl('https://api.corevent.site')).toBe('https://api.corevent.site')
  })

  it('deve aceitar http:// em ambiente local', () => {
    expect(normalizeApiBaseUrl('http://localhost:3000/')).toBe('http://localhost:3000')
  })

  it('deve rejeitar string vazia', () => {
    expect(() => normalizeApiBaseUrl('')).toThrow('API base URL must be a non-empty string')
  })

  it('deve rejeitar URL sem protocolo http(s)', () => {
    expect(() => normalizeApiBaseUrl('api.corevent.site')).toThrow(
      'API base URL must start with http:// or https://',
    )
  })
})
