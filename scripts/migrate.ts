import 'dotenv/config'
import { getPayload } from 'payload'
process.env.PAYLOAD_MIGRATING = 'true'
const payload = await getPayload({ config: (await import('../src/payload.config')).default })
try {
  await payload.db.migrate()
  console.log('Committed migrations applied. No development schema push was used.')
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Migration failed.')
  process.exit(1)
}
process.exit(0)
