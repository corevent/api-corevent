# PI Tests — Automação de Testes (Corevent)

Suíte didática da disciplina de automação de testes do Projeto Integrador.

Contém **1 teste Jest**, **1 teste Supertest** e **1 teste Cypress**, conforme o roteiro.

## Por que `cy.request`?

O Corevent é um app **mobile** (Flutter) + API NestJS. O Cypress é focado em Web; o roteiro permite testar os **endpoints da API** com `cy.request` nesse cenário.

## URL alvo

| Ambiente | URL |
| --- | --- |
| Padrão (produção) | `https://api.corevent.site` |
| Local (opcional) | `http://localhost:3000` |

Sobrescreva com a variável `API_BASE_URL`:

```bash
API_BASE_URL=http://localhost:3000 pnpm run test:api
```

## Fluxo crítico (Passo 1 do roteiro)

1. **URL inicial:** `https://api.corevent.site`
2. **Funcionalidade:** disponibilidade da API + autenticação (`/api/health` e `/api/auth/login`)
3. **Passos automatizados:**
   - `GET /api/health` → API saudável (200)
   - `POST /api/auth/login` com credenciais inválidas → rejeição (401)
   - `POST /api/auth/login` sem senha → erro de validação (400)

Não cria usuários em produção (evita poluir o banco).

## Estrutura

```
pi-tests/
  src/normalize-api-base-url.js          # função pura
  tests/unit/normalize-api-base-url.test.js   # Jest
  tests/api/health.test.js                    # Supertest
  cypress/e2e/teste_pi.cy.js                  # Cypress
```

## Instalação

Como `pi-tests` fica dentro do repositório da API (que já usa pnpm), use `--ignore-workspace` para instalar as dependências só desta pasta:

```bash
cd pi-tests
pnpm install --ignore-workspace
```

O binário do Cypress (Electron) é baixado sob demanda: os scripts `test:e2e` e `cypress:open` rodam `cypress install` antes. Se quiser instalar na mão:

```bash
pnpm run cypress:install
```

## Como rodar

```bash
# Prática 1 — Jest (unitário)
pnpm run test:unit

# Prática 2 — Supertest (API)
pnpm run test:api

# Prática 3 — Cypress (fluxo crítico via API)
pnpm run test:e2e

# Abrir Cypress no modo interativo
pnpm run cypress:open

# Rodar os três
pnpm run test:all
```
