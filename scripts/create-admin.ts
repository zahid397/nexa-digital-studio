import 'dotenv/config'
import { getPayload } from 'payload'
import { createFirstAdministrator, ownerCredentials, OwnerSetupError } from './owner-setup'

try {
  const credentials = ownerCredentials({
    INITIAL_ADMIN_EMAIL: process.env.INITIAL_ADMIN_EMAIL,
    INITIAL_ADMIN_PASSWORD: process.env.INITIAL_ADMIN_PASSWORD,
  })
  const payload = await getPayload({ config: (await import('../src/payload.config')).default })
  await createFirstAdministrator(payload, credentials)
  console.log('Initial administrator created. Credentials were not printed. Remove bootstrap credentials from the owner environment; do not add them to Vercel Production.')
} catch (error) {
  console.error(error instanceof OwnerSetupError ? error.message
    : 'Administrator setup failed. Check the private database connection, committed migration status and owner environment. No credentials were printed.')
  process.exit(1)
}
// Payload writes have committed. CLI exit closes persistent WebSocket sessions.
process.exit(0)
