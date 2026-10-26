import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const email = process.env.INITIAL_ADMIN_EMAIL
const password = process.env.INITIAL_ADMIN_PASSWORD
if (!email || !password || password.length < 16)
  throw new Error(
    'Set INITIAL_ADMIN_EMAIL and a unique INITIAL_ADMIN_PASSWORD of at least 16 characters in the local environment.',
  )
const payload = await getPayload({ config })
try {
  const { totalDocs } = await payload.count({ collection: 'users', overrideAccess: true })
  if (totalDocs !== 0)
    throw new Error(
      'An administrator already exists. Initial setup does not replace existing users or passwords.',
    )
  await payload.create({
    collection: 'users',
    overrideAccess: true,
    context: { secureBootstrap: true },
    data: { name: 'Studio Administrator', role: 'admin', email, password },
  })
  console.log(
    'Initial administrator created. Credentials were not printed. Remove INITIAL_ADMIN_PASSWORD from deployment environment variables.',
  )
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Administrator setup failed.')
  process.exit(1)
}
// Every database write above has committed. Explicit CLI exit also closes the
// adapter's persistent health-check connection in restricted WebSocket sessions.
process.exit(0)
