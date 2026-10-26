import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import type { Payload } from 'payload'
import { seedDemo } from '../scripts/seed-demo'
import { hasEditorialContent, missingDefaults } from '../scripts/seed-helpers'
import { createFirstAdministrator, ownerCredentials, OwnerSetupError } from '../scripts/owner-setup'

type Document = Record<string, unknown>

// In-memory contract fixture for seed control flow only. Real Payload validation,
// publication and PostgreSQL persistence are covered by the isolated DB suite.
function fixture() {
  const collections: Record<string, Document[]> = { categories: [], services: [], projects: [] }
  const globals: Record<string, Document> = {}
  let nextId = 1
  function matches(document: Document, where: Document = {}): boolean {
    return Object.entries(where).every(([field, condition]) => {
      if (field === 'and') return (condition as Document[]).every((part) => matches(document, part))
      const comparison = condition as { equals?: unknown; in?: unknown[] }
      return comparison.in ? comparison.in.includes(document[field]) : document[field] === comparison.equals
    })
  }
  const payload = {
    find: async ({ collection, where }: { collection: string; where: Document }) => {
      const docs = collections[collection].filter((document) => matches(document, where))
      return structuredClone({ docs, totalDocs: docs.length })
    },
    count: async ({ collection, where }: { collection: string; where: Document }) => ({
      totalDocs: collections[collection].filter((document) => matches(document, where)).length,
    }),
    create: async ({ collection, data }: { collection: string; data: Document }) => {
      const document = { id: nextId++, ...structuredClone(data) }
      collections[collection].push(document)
      return structuredClone(document)
    },
    findGlobal: async ({ slug }: { slug: string }) => structuredClone(globals[slug] ?? {}),
    updateGlobal: async ({ slug, data }: { slug: string; data: Document }) => {
      globals[slug] = { ...(globals[slug] ?? { id: nextId++ }), ...structuredClone(data) }
      return structuredClone(globals[slug])
    },
  } as unknown as Payload
  return { payload, collections, globals }
}

test('default repair fills missing fields while preserving edited values, nested SEO and cleared arrays', () => {
  const current = {
    heroTitle: 'The editor headline', heroAccent: '  ', advantages: [],
    seo: { title: 'The editor SEO title', description: null, custom: 'retained' },
    _status: 'published', id: 42,
  }
  const before = structuredClone(current)
  const patch = missingDefaults(current, {
    heroTitle: 'Default headline', heroAccent: 'Useful digital.', advantages: [{ title: 'Demo' }],
    seo: { title: 'Default SEO', description: 'A useful description.' }, _status: 'published',
  })
  assert.deepEqual(patch, {
    heroAccent: 'Useful digital.',
    seo: { title: 'The editor SEO title', description: 'A useful description.', custom: 'retained' },
  })
  assert.deepEqual(current, before)
})

test('uninitialized metadata and empty arrays allow first content initialization', () => {
  const current = { id: 1, _status: 'draft', createdAt: '2026-10-26', values: [] }
  assert.equal(hasEditorialContent(current), false)
  assert.equal(hasEditorialContent({ ...current, title: 'A deliberate draft' }), true)
  assert.deepEqual(missingDefaults(current, { values: [{ title: 'Curiosity' }] }, { initialize: true }), {
    values: [{ title: 'Curiosity' }],
  })
})

test('empty seed creates all six published examples and repeated seed changes no editorial content', async () => {
  const state = fixture()
  const first = await seedDemo(state.payload)
  assert.equal(first.complete, true)
  assert.equal(first.services.created, 6)
  assert.equal(first.services.published, 6)
  assert.equal(first.projects.created, 6)
  assert.equal(first.projects.published, 6)
  assert.ok(state.collections.projects.every((project) => project.isDemo === true))
  assert.equal(state.globals.home._status, 'published')
  assert.equal(state.globals.about._status, 'published')
  assert.equal((state.globals['site-settings'].navigation as unknown[]).length, 5)
  const before = structuredClone({ collections: state.collections, globals: state.globals })
  const second = await seedDemo(state.payload)
  assert.equal(second.complete, true)
  assert.equal(second.services.created, 0)
  assert.equal(second.services.preserved, 6)
  assert.equal(second.projects.created, 0)
  assert.equal(second.projects.preserved, 6)
  assert.ok(second.globals.every((global) => global.action === 'preserved'))
  assert.deepEqual({ collections: state.collections, globals: state.globals }, before)
})

test('seed never republishes existing drafts or replaces edited records and truthfully reports incomplete setup', async () => {
  const state = fixture()
  const edited = { id: 99, slug: 'web-development', title: 'The owner service', description: 'Edited copy', _status: 'draft' }
  state.collections.services.push(structuredClone(edited))
  state.globals.home = { heroTitle: 'The owner headline', _status: 'published', advantages: [] }
  state.globals.about = { title: 'Private draft', intro: 'Not ready to publish', _status: 'draft' }
  const draft = structuredClone(state.globals.about)
  const result = await seedDemo(state.payload)
  assert.deepEqual(state.collections.services.find((service) => service.id === 99), edited)
  assert.deepEqual(state.globals.about, draft)
  assert.equal(state.globals.home.heroTitle, 'The owner headline')
  assert.deepEqual(state.globals.home.advantages, [])
  assert.ok(state.globals.home.heroDescription)
  assert.equal(result.services.created, 5)
  assert.equal(result.services.published, 5)
  assert.deepEqual(result.services.unpublished, ['web-development'])
  assert.equal(result.globals.find((global) => global.slug === 'about')?.action, 'preserved-draft')
  assert.equal(result.globals.find((global) => global.slug === 'home')?.needsReview, true)
  assert.equal(result.complete, false)
})

test('owner setup rejects unavailable, malformed or padding-only credentials without echoing them', () => {
  const secret = randomUUID()
  for (const environment of [
    {}, { INITIAL_ADMIN_EMAIL: 'not-an-email', INITIAL_ADMIN_PASSWORD: secret },
    { INITIAL_ADMIN_EMAIL: 'owner@example.test', INITIAL_ADMIN_PASSWORD: ' '.repeat(30) },
  ]) {
    assert.throws(() => ownerCredentials(environment), (error: unknown) =>
      error instanceof OwnerSetupError && !error.message.includes(secret))
  }
  assert.deepEqual(ownerCredentials({ INITIAL_ADMIN_EMAIL: ' Owner@Example.Test ', INITIAL_ADMIN_PASSWORD: secret }), {
    email: 'owner@example.test', password: secret,
  })
})

function bootstrapFixture(users: number) {
  const statements: string[] = []
  const writes: Document[] = []
  let released = 0
  const payload = {
    db: { pool: { connect: async () => ({
      query: async (sql: string) => { statements.push(sql) },
      release: () => { released++ },
    }) } },
    count: async () => ({ totalDocs: users }),
    create: async (options: Document) => { writes.push(options) },
  } as unknown as Payload
  return { payload, statements, writes, released: () => released }
}

test('first administrator setup refuses existing users under the owner lock without replacing credentials', async () => {
  const state = bootstrapFixture(1)
  await assert.rejects(createFirstAdministrator(state.payload, { email: 'owner@example.test', password: randomUUID() }), OwnerSetupError)
  assert.deepEqual(state.writes, [])
  assert.ok(state.statements.some((statement) => statement.includes('pg_advisory_xact_lock')))
  assert.equal(state.statements.at(-1), 'ROLLBACK')
  assert.equal(state.released(), 1)
})

test('first administrator setup uses the private bootstrap context and releases its transaction lock', async () => {
  const state = bootstrapFixture(0)
  await createFirstAdministrator(state.payload, { email: 'owner@example.test', password: randomUUID() })
  assert.equal(state.writes.length, 1)
  assert.equal(state.writes[0].overrideAccess, true)
  assert.deepEqual(state.writes[0].context, { secureBootstrap: true })
  assert.equal(state.statements.at(-1), 'COMMIT')
  assert.equal(state.released(), 1)
})
