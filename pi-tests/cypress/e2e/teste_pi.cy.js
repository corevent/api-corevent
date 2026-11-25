describe('Teste de Fluxo Crítico - Projeto Integrador', () => {
  const apiBaseUrl = Cypress.env('API_BASE_URL') || 'https://api.corevent.site'

  it('Deve executar o fluxo principal com sucesso', () => {
    // 1. API no ar (health check)
    cy.request('GET', `${apiBaseUrl}/api/health`).then((healthResponse) => {
      expect(healthResponse.status).to.eq(200)
      expect(healthResponse.body).to.have.property('status')
    })

    // 2. Login com credenciais inválidas — autenticação rejeitada
    cy.request({
      method: 'POST',
      url: `${apiBaseUrl}/api/auth/login`,
      failOnStatusCode: false,
      body: {
        email: 'usuario.inexistente@teste.com',
        password: 'senhaInvalida123',
      },
    }).then((loginResponse) => {
      expect(loginResponse.status).to.eq(401)
    })

    // 3. Login com body incompleto — validação do DTO
    cy.request({
      method: 'POST',
      url: `${apiBaseUrl}/api/auth/login`,
      failOnStatusCode: false,
      body: {
        email: 'usuario@teste.com',
      },
    }).then((validationResponse) => {
      expect(validationResponse.status).to.eq(400)
    })
  })
})
