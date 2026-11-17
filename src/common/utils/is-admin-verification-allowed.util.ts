export function isAdminVerificationAllowed(nodeEnv: string | undefined): boolean {
  return nodeEnv !== 'production'
}
