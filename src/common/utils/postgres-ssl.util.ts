export type PostgresSslOptions = false | { rejectUnauthorized: boolean; ca?: string }

export function resolvePostgresSsl(params: {
  isSslEnabled: boolean
  rejectUnauthorizedEnv?: string
  ca?: string
}): PostgresSslOptions {
  if (!params.isSslEnabled) {
    return false
  }

  const rejectUnauthorized = params.rejectUnauthorizedEnv !== 'false'
  return {
    rejectUnauthorized,
    ...(params.ca ? { ca: params.ca } : {}),
  }
}
