import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { test } from 'node:test'
import { contactSchema } from '../src/lib/contact'

const inquiry = () => ({
  name: 'QA Contact Reviewer',
  email: 'reviewer@example.test',
  service: 'cms-development',
  message: 'A complete project inquiry with enough detail to validate.',
  submissionId: randomUUID(),
})

test('contact normalizes ordinary pasted email and service whitespace before persistence', () => {
  const parsed = contactSchema.parse({
    ...inquiry(),
    email: '  Reviewer@Example.Test  ',
    service: ' cms-development ',
  })
  assert.equal(parsed.email, 'reviewer@example.test')
  assert.equal(parsed.service, 'cms-development')
})

test('contact rejects blank service choices, malformed email and overlong email after normalization', () => {
  for (const change of [
    { service: '   ' },
    { email: 'not-an-email' },
    { email: `${'a'.repeat(245)}@example.test` },
  ])
    assert.equal(contactSchema.safeParse({ ...inquiry(), ...change }).success, false)
})
