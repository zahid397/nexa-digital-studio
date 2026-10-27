import type { Payload } from 'payload'

export class OwnerSetupError extends Error {}

export function ownerCredentials(environment: { INITIAL_ADMIN_EMAIL?: string; INITIAL_ADMIN_PASSWORD?: string }) {
  const email = environment.INITIAL_ADMIN_EMAIL?.trim().toLowerCase()
  const password = environment.INITIAL_ADMIN_PASSWORD
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.trim().length < 16)
    throw new OwnerSetupError(
      'Set a valid INITIAL_ADMIN_EMAIL and a unique INITIAL_ADMIN_PASSWORD of at least 16 non-padding characters in the private owner environment.',
    )
  return { email, password }
}

/**
 * Serialize owner CLI processes, including through a Neon transaction pooler.
 * This short transaction owns only the advisory lock; Payload's local API writes
 * commit normally. A failed seed may be resumed without overwriting its records.
 */
export async function withOwnerSetupLock<T>(payload: Payload, name: string, operation: () => Promise<T>): Promise<T> {
  const connection = await payload.db.pool.connect()
  try {
    await connection.query('BEGIN')
    await connection.query("SET LOCAL lock_timeout = '30s'")
    await connection.query('SELECT pg_advisory_xact_lock(hashtext($1))', [name])
    const result = await operation()
    await connection.query('COMMIT')
    return result
  } catch (error) {
    await connection.query('ROLLBACK').catch(() => undefined)
    throw error
  } finally {
    connection.release()
  }
}

export async function createFirstAdministrator(payload: Payload, credentials: { email: string; password: string }) {
  return withOwnerSetupLock(payload, 'nexa-first-administrator', async () => {
    const { totalDocs } = await payload.count({ collection: 'users', overrideAccess: true })
    if (totalDocs !== 0)
      throw new OwnerSetupError('An administrator already exists. Initial setup does not replace existing users or passwords.')
    await payload.create({
      collection: 'users', overrideAccess: true, context: { secureBootstrap: true },
      data: { name: 'Studio Administrator', role: 'admin', ...credentials },
    })
  })
}
