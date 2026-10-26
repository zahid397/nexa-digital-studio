import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { getPayload, type Payload } from 'payload'
import { loadTestEnvironment } from './guard'
import { contactSchema } from '../src/lib/contact'
import type { User, Project } from '../src/payload-types'

loadTestEnvironment()
let payload: Payload
let admin: User & { collection: 'users' }
let project: Project
const slug = 'qa-integration-' + randomUUID()
const publicOptions = { overrideAccess: false, user: null }
before(async () => {
  payload = await getPayload({ config: (await import('../src/payload.config')).default })
  const users = await payload.find({
    collection: 'users',
    overrideAccess: true,
    where: { email: { equals: process.env.INITIAL_ADMIN_EMAIL } },
    limit: 1,
  })
  assert.ok(users.docs[0], 'Create the isolated test administrator first.')
  admin = { ...users.docs[0], collection: 'users' }
})
after(async () => {
  if (project)
    await payload.delete({ collection: 'projects', id: project.id, overrideAccess: true })
  void payload?.destroy()
})
test('strict contact validation rejects bad input and accepts a real inquiry shape', () => {
  assert.equal(contactSchema.safeParse({ name: 'X', email: 'bad' }).success, false)
  assert.equal(
    contactSchema.safeParse({
      name: 'QA Reviewer',
      email: 'qa@example.test',
      service: 'cms-development',
      message: 'A properly detailed demonstration inquiry.',
      submissionId: randomUUID(),
    }).success,
    true,
  )
})
test('anonymous users cannot access the inquiry inbox or create administrators', async () => {
  await assert.rejects(payload.find({ collection: 'inquiries', ...publicOptions }))
  await assert.rejects(
    payload.create({
      collection: 'users',
      ...publicOptions,
      data: {
        name: 'Forbidden',
        email: 'forbidden@example.test',
        password: randomUUID(),
        role: 'admin',
      },
    }),
  )
  await assert.rejects(
    payload.create({
      collection: 'users',
      overrideAccess: true,
      data: {
        name: 'Forbidden',
        email: 'first-user-bypass@example.test',
        password: randomUUID(),
        role: 'admin',
      },
    }),
  )
})
test('draft projects stay private, publishing exposes them, and unpublishing removes them', async () => {
  const category = (await payload.find({ collection: 'categories', limit: 1 })).docs[0]
  assert.ok(category)
  project = await payload.create({
    collection: 'projects',
    user: admin,
    overrideAccess: false,
    draft: true,
    data: {
      title: 'Isolated integration project',
      slug,
      category: category.id,
      image: '/images/orbit.svg',
      imageAlt: 'Integration fixture',
      summary: 'An isolated draft/publish test.',
      overview: 'A test overview.',
      challenge: 'A test challenge.',
      solution: 'A test solution.',
      year: '2026',
      _status: 'draft',
      isDemo: true,
    },
  })
  assert.equal(
    (
      await payload.find({
        collection: 'projects',
        ...publicOptions,
        where: { slug: { equals: slug } },
      })
    ).totalDocs,
    0,
  )
  await payload.update({
    collection: 'projects',
    id: project.id,
    user: admin,
    overrideAccess: false,
    data: { _status: 'published' },
  })
  assert.equal(
    (
      await payload.find({
        collection: 'projects',
        ...publicOptions,
        where: { slug: { equals: slug } },
        draft: false,
      })
    ).totalDocs,
    1,
  )
  await payload.update({
    collection: 'projects',
    id: project.id,
    user: admin,
    overrideAccess: false,
    data: { _status: 'draft' },
  })
  assert.equal(
    (
      await payload.find({
        collection: 'projects',
        ...publicOptions,
        where: { slug: { equals: slug } },
        draft: false,
      })
    ).totalDocs,
    0,
  )
})
test('homepage publication persists and anonymous users cannot edit global settings', async () => {
  const home = await payload.findGlobal({ slug: 'home' })
  await assert.rejects(
    payload.updateGlobal({ slug: 'home', ...publicOptions, data: { heroTitle: 'Forbidden' } }),
  )
  const marker = 'A fresh perspective.'
  try {
    await payload.updateGlobal({
      slug: 'home',
      user: admin,
      overrideAccess: false,
      data: { heroTitle: marker, _status: 'published' },
    })
    const read = await payload.findGlobal({ slug: 'home', ...publicOptions, draft: false })
    assert.equal(read.heroTitle, marker)
  } finally {
    await payload.updateGlobal({
      slug: 'home',
      overrideAccess: true,
      data: { heroTitle: home.heroTitle, _status: 'published' },
    })
  }
})
