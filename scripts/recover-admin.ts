import 'dotenv/config'
import { getPayload } from 'payload'
const email = process.env.INITIAL_ADMIN_EMAIL
const password = process.env.INITIAL_ADMIN_PASSWORD
if (!email || !password || password.length < 16)
  throw new Error(
    'Provide the existing administrator email and a new password of at least 16 characters in your private environment.',
  )
if (process.env.CONFIRM_ADMIN_RECOVERY !== 'true')
  throw new Error('Owner recovery requires CONFIRM_ADMIN_RECOVERY=true.')
const payload = await getPayload({ config: (await import('../src/payload.config')).default })
try {
  const { docs } = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })
  if (!docs[0]) throw new Error('The administrator was not found.')
  await payload.update({
    collection: 'users',
    id: docs[0].id,
    overrideAccess: true,
    data: { password, loginAttempts: 0, lockUntil: null },
  })
  console.log('Administrator credentials rotated. No password was printed.')
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Recovery failed.')
  process.exit(1)
}
process.exit(0)
