const legacyTlsModes = new Set(['prefer', 'require', 'verify-ca'])

/** Keep node-postgres's current certificate verification explicit across driver upgrades. */
export function normalizeDatabaseUrl(connectionString: string): string {
  let parsed: URL
  try {
    parsed = new URL(connectionString)
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || !parsed.hostname)
      throw new Error()
  } catch {
    // URL parser errors can include credentials from their input.
    throw new Error('Invalid database connection URL.')
  }
  if (!parsed.search) return connectionString

  // Replace only the relevant query values; URL serialization can also rewrite
  // credentials, host spelling, or unrelated query parameter encoding.
  const queryStart = connectionString.indexOf('?')
  const fragmentStart = connectionString.indexOf('#', queryStart)
  const queryEnd = fragmentStart === -1 ? connectionString.length : fragmentStart
  const query = connectionString.slice(queryStart + 1, queryEnd)
  const normalized = query.split('&').map((parameter) => {
    const mode = new URLSearchParams(parameter).get('sslmode')
    return mode && legacyTlsModes.has(mode)
      ? `${parameter.slice(0, parameter.indexOf('='))}=verify-full`
      : parameter
  }).join('&')
  return connectionString.slice(0, queryStart + 1) + normalized + connectionString.slice(queryEnd)
}
