# Distribuição privada de APKs

Os aplicativos publicam no mesmo bucket usado pela API do respectivo ambiente.

| Ambiente | Projeto | Bucket |
| --- | --- | --- |
| Staging | corevent-staging-510316 | corevent-staging-bucket |
| Produção | corevent | corevent |

Cada bucket contém `downloads/app/` e `downloads/work/`. Os APKs são privados;
avatars e imagens de eventos mantêm suas permissões existentes.

## Manifesto de release

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

Os workflows mobile assinam e publicam os APKs e atualizam o manifesto.
A API confere o SHA-256 registrado nos metadados do objeto e o tamanho antes
de assinar o download, fixando a geração do objeto.

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

## Acesso ao bucket

A conta de serviço da API precisa de `storage.objects.get` nos objetos sob
`downloads/` e de `iam.serviceAccounts.signBlob` sobre a própria conta para
gerar as URLs assinadas. Os objetos permanecem privados.

## Ativação e validação

Após o deploy, consultar `/latest` para cada app e confirmar que os metadados
correspondem ao manifesto publicado. Seguir o redirecionamento da rota de
download e comparar o SHA-256 do APK baixado com o valor do manifesto.

## Verificações locais

```sh
pnpm build
pnpm test -- --runInBand
```

Os testes de downloads usam armazenamento simulado e um servidor HTTP local;
não acessam banco de dados, Google Cloud ou outros serviços externos.
