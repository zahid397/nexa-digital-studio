import 'dotenv/config'
import { getPayload } from 'payload'
import { seedDemo } from './seed-demo'
import { OwnerSetupError, withOwnerSetupLock } from './owner-setup'

try {
  if (process.env.SEED_DEMO !== 'true')
    throw new OwnerSetupError('Set SEED_DEMO=true explicitly to add fictional demo content. Existing records are preserved.')
  const payload = await getPayload({ config: (await import('../src/payload.config')).default })
  const summary = await withOwnerSetupLock(payload, 'nexa-demo-seed', () => seedDemo(payload))
  for (const collection of ['services', 'projects'] as const) {
    const counts = summary[collection]
    console.log(`${collection}: ${counts.published}/6 intended examples published; ${counts.created} created, ${counts.preserved} existing records preserved.`)
    if (counts.unpublished.length)
      console.warn(`Existing unpublished ${collection} preserved: ${counts.unpublished.join(', ')}. Review and publish intentionally through the CMS.`)
  }
  for (const global of summary.globals) {
    console.log(`${global.slug}: ${global.action}${global.filledFields.length ? ` (${global.filledFields.join(', ')})` : ''}.`)
    if (global.needsReview) console.warn(`${global.slug}: existing unpublished or deliberately empty editorial sections require owner review.`)
  }
  console.log(summary.complete
    ? 'Fictional demo content verified. Existing editorial content was preserved.'
    : 'Existing editorial decisions were preserved. Owner review is required; setup has not been reported as fully published.')
  process.exit(summary.complete ? 0 : 2)
} catch (error) {
  console.error(error instanceof OwnerSetupError ? error.message
    : 'Demo seeding failed. Check the private database connection, committed migration status and owner environment. Rerunning safely resumes missing examples; existing records are not overwritten.')
  process.exit(1)
}
