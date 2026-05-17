export interface PasswordRecoveryCode {
  userId: string
  codeHash: string
  expiresAt: Date
  used: boolean
}
