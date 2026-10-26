import { loadTestEnvironment } from './guard'
import { getPayload } from 'payload'
import { sql } from '@payloadcms/db-postgres'
loadTestEnvironment()
const payload = await getPayload({ config: (await import('../src/payload.config')).default })
try {
  await payload.db.drizzle.execute(sql`DELETE FROM contact_rate_limits`)
  await payload.delete({
    collection: 'projects',
    overrideAccess: true,
    where: { slug: { contains: 'qa-browser-' } },
  })
  await payload.delete({
    collection: 'inquiries',
    overrideAccess: true,
    where: {
      or: [
        { email: { equals: 'reviewer@example.test' } },
        { email: { equals: 'api@example.test' } },
      ],
    },
  })
  const home = await payload.findGlobal({ slug: 'home' })
  if (home.heroTitle === 'A different kind of studio.')
    await payload.updateGlobal({
      slug: 'home',
      data: { heroTitle: 'Good ideas.', _status: 'published' },
      overrideAccess: true,
    })
  console.log('Isolated fixtures and contact limit reset.')
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Test setup failed.')
  process.exit(1)
}
process.exit(0)
