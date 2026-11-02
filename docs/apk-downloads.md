# Distribuição privada de APKs

Os aplicativos publicam no mesmo bucket usado pela API do respectivo ambiente.

| Ambiente | Projeto | Bucket |
| --- | --- | --- |
| Staging | corevent-staging-510316 | corevent-staging-bucket |
| Produção | corevent | corevent |

Cada bucket contém `downloads/app/` e `downloads/work/`. Os APKs são privados;
avatars e imagens de eventos mantêm suas permissões existentes.

## Contrato de publicação

`downloads/<app>/latest.json` contém o mesmo documento de
`downloads/<app>/releases/<releaseId>/release.json`:

```json
{
  "schemaVersion": 1,
  "app": "app",
  "environment": "staging",
  "packageName": "com.corevent.coreventapp.development",
  "versionName": "1.0.0",
  "versionCode": 42,
  "releaseId": "1.0.0-42-123-1",
  "commit": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "runId": "123",
  "runAttempt": 1,
  "publishedAt": "2026-11-02T15:00:00Z",
  "apkPath": "downloads/app/releases/1.0.0-42-123-1/app.apk",
  "sizeBytes": 1234,
  "sha256": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
}
```

Exemplo ilustrativo. Cada release também contém `app.apk` e `app.apk.sha256`.
O publicador valida a assinatura, pacote, versão, integridade e identidade do
workflow; os objetos versionados não podem ser substituídos por conteúdo diferente.
`latest.json` só é atualizado após os três uploads, com precondição de geração.
Uma publicação antiga ou um versionCode reutilizado com outro APK é rejeitado.
Os objetos recebem SHA-256 nos metadados; a API confere esse hash e o tamanho
antes de assinar o download, fixando a geração do objeto.

## Endpoints públicos

- `GET /api/downloads/app/latest`: metadados do Corevent em `{ data: ... }`.
- `GET /api/downloads/work/latest`: metadados do Corevent para Equipes.
- `GET /api/downloads/app`: redirecionamento 302 para o APK do Corevent.
- `GET /api/downloads/work`: redirecionamento 302 para o APK de Equipes.

Os redirecionamentos usam URLs V4 válidas por 15 minutos. Respostas da API usam
`Cache-Control: no-store`. Não é possível solicitar caminhos arbitrários.
Aplicativo desconhecido retorna 400; publicação ausente retorna 404; manifesto
inválido, acesso indisponível ou integridade divergente retorna 503.
O limite é de 60 requisições por minuto por endereço, por rota.

O bucket vem de `GCS_BUCKET`. `APK_DOWNLOADS_ENVIRONMENT` pode definir explicitamente
`staging` ou `production`; na ausência dessa variável, `NODE_ENV=production` e
`NODE_ENV=prod` selecionam produção, e outros valores selecionam staging.
Isso contempla os valores atualmente usados pelos dois serviços Cloud Run.

## Infraestrutura

Os scripts em `ops/apk-publishing/` são executados por um operador autenticado
com permissão de administrar WIF, contas de serviço, roles e IAM dos buckets,
além de configurar Environments dos dois repositórios no GitHub.

```powershell
# Inspecionar o plano sem modificar recursos
./ops/apk-publishing/configure.ps1 -Environment staging
./ops/apk-publishing/configure.ps1 -Environment production

# Aplicar configuração idempotente
./ops/apk-publishing/configure.ps1 -Environment staging -Apply
./ops/apk-publishing/configure.ps1 -Environment production -Apply
./ops/apk-publishing/configure-staging-signing.ps1 -Apply
```

Cada projeto possui pool `github-apk` e provider `github`, limitado ao proprietário,
IDs dos dois repositórios, branch e Environment esperados. Cada app usa sua própria
conta `github-apk-app` ou `github-apk-work`, com acesso condicionado ao prefixo
correspondente. A identidade E2E existente permanece independente.

A API recebe leitura de `downloads/` e permissão `iam.serviceAccounts.signBlob`
sobre sua própria conta por meio da role customizada `apkDownloadSigner`.
Nenhuma política de leitura pública é adicionada.

## Ativação e validação

1. Integrar primeiro o PR da API em `develop` e aguardar o deploy de staging.
2. Integrar os PRs dos apps em `develop`; a publicação ocorre no próximo build.
3. Conferir os quatro arquivos da publicação e os endpoints de staging.
4. Comparar o SHA-256 do APK baixado e instalar os dois aplicativos.
5. Publicar uma nova execução e validar atualização sobre a instalação anterior.
6. Promover os mesmos commits para `main` seguindo o Gitflow e o deploy da API.
7. Executar manualmente `Release APK` em cada app com build_number maior que 2 e
   maior que qualquer versão posteriormente distribuída.

Não lançar os workflows em branches de trabalho: os jobs e a identidade WIF
exigem `develop/staging` ou `main/production`. Nenhuma página é implantada nesta etapa.

Reexecutar o mesmo build não permite substituir um APK publicado por outro
conteúdo. Use uma execução nova em staging ou um novo build_number em produção.
Para retirar uma versão com problema, um operador pode restaurar o manifesto
de uma release anterior usando a geração atual de `latest.json` como precondição.
Isso muda o download oferecido; aparelhos já atualizados exigem uma correção com
versionCode maior. Não há limpeza automática de versões nesta implantação.

## Verificações locais

```sh
pnpm build
pnpm test -- --runInBand
```

Os testes de downloads usam armazenamento simulado e um servidor HTTP local;
não acessam banco de dados, Google Cloud ou outros serviços externos.
