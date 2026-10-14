# Mensagem de commit

Ao utilizar este comando, produza uma mensagem de commit baseada nas adições, alterações e exclusões feitas no projeto.

Regras:

* A mensagem deve ser sempre em inglês.
* Utilize o padrão Conventional Commits.
* Sempre analise o diff completo do projeto, não apenas as alterações feitas durante a conversa.
* Retorne **somente a mensagem do commit**, sem explicações, comentários ou texto adicional.
* **NÃO utilize comandos Git.**
* **NÃO inclua `git commit`, `git commit -m` ou qualquer outro comando de terminal.**
* **NÃO utilize heredoc (`EOF`) ou qualquer estrutura de shell.**
* O conteúdo retornado deve ser diretamente a mensagem que será usada no commit.
* A mensagem deve conter o título do commit e, quando necessário, uma lista de alterações usando `-`.
* Formate a resposta em um bloco de código `bash` apenas para facilitar a cópia. O bloco deve conter exclusivamente a mensagem do commit, e não um comando shell.

Exemplo de saída:

```bash
feat(auth): add refresh sessions and cleanup job; fix imports

- Change from refresh tokens to refresh sessions
- Enhance security by using refresh sessions with verification on previous token
- Add cleanup job to delete expired sessions
- Fix imports on various files
```

Nunca retorne:

```bash
git commit -m "$(cat <<'EOF'
...
EOF
)"
```

Retorne apenas:

```bash
feat(health): return JSON status for database, mail, and S3

- Replace the plain health string with status, version, and uptime
- Nest database, Resend SMTP, and S3 bucket checks under dependencies
- Mark the API unhealthy when any dependency check fails
- Remove the ping endpoint
```
