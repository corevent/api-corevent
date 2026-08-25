import { registerUser } from './helpers/api'
import { errorText } from './helpers/fixtures'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T04 - Cadastro com CPF/CNPJ inválido', () => {
  const ctx = setupE2EApp()

  it('rejects invalid document with 400', async () => {
    const res = await registerUser(ctx.app, { document: '00000000000' })

    expect(res.status).toBe(400)
    expect(errorText(res.body).toLowerCase()).toMatch(/invalid cpf/)
  })
})
