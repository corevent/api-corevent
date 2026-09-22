# Mensagem de commit

Ao utilizar esse comando, produza uma mensagem de commit baseado nas adições/alterações/exclusões feitas no projeto, sempre em inglês. Utilize o padrão convetional commits. Apenas retorne a mensagem para o usuário, não utilize os comandos git. Exemplo:

feat(auth): add refresh sessions and cleanup job; fix imports

- Change from refresh tokens to refresh sessions
- Enhance security by using refresh sessions with verification on previous token
- Add cleanup job to delete expired sessions
- Fix imports on various files

### Retorne no formato bash para que o usuário consiga copiar
### Sempre analise o diff completo, não só o que foi feito durante a conversa