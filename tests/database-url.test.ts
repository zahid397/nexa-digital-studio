import assert from 'node:assert/strict'
import { test } from 'node:test'
import { inspect } from 'node:util'
import { randomUUID } from 'node:crypto'
import { normalizeDatabaseUrl } from '../src/lib/database-url'

test('Neon pooled and direct connections upgrade legacy SSL modes to certificate verification', () => {
  for (const host of [
    'ep-nexa-review-pooler.us-east-1.aws.neon.tech',
    'ep-nexa-review.us-east-1.aws.neon.tech',
  ]) {
    for (const mode of ['prefer', 'require', 'verify-ca']) {
      const original = new URL(`postgresql://studio:password@${host}:5432/nexa?sslmode=${mode}`)
      const normalized = new URL(normalizeDatabaseUrl(original.toString()))
      assert.equal(normalized.searchParams.get('sslmode'), 'verify-full')
      assert.equal(normalized.protocol, original.protocol)
      assert.equal(normalized.username, original.username)
      assert.equal(normalized.password, original.password)
      assert.equal(normalized.host, original.host)
      assert.equal(normalized.pathname, original.pathname)
    }
  }
})

test('SSL normalization preserves encoded credentials, database paths and additional connection flags', () => {
  const value = 'postgres://owner%40example.test:p%3Aa%2Fss%23%3F%25@ep-nexa-review-pooler.us-east-1.aws.neon.tech:5432/studio%2Dreview?application_name=owner%20setup&sslmode=require&sslrootcert=%2Ftmp%2Ftrusted%20CA.pem&sslcert=%2Ftmp%2Fclient.pem&sslkey=%2Ftmp%2Fclient.key&channel_binding=require&options=-c%20statement_timeout%3D5000&tag=one&tag=two'
  const original = new URL(value)
  const result = normalizeDatabaseUrl(value)
  assert.equal(result, value.replace('sslmode=require', 'sslmode=verify-full'))
  const normalized = new URL(result)
  assert.equal(normalized.username, original.username)
  assert.equal(normalized.password, original.password)
  assert.equal(normalized.host, original.host)
  assert.equal(normalized.pathname, original.pathname)
  assert.equal(normalized.searchParams.get('sslmode'), 'verify-full')
  assert.deepEqual(
    [...normalized.searchParams].filter(([key]) => key !== 'sslmode'),
    [...original.searchParams].filter(([key]) => key !== 'sslmode'),
  )
})

test('verified, local and unspecified SSL policies pass through unchanged', () => {
  for (const value of [
    'postgresql://studio:password@ep-nexa-review.us-east-1.aws.neon.tech/nexa?sslmode=verify-full&channel_binding=require',
    'postgres://studio:password@127.0.0.1:5432/nexa?sslmode=disable',
    'postgresql://studio:password@localhost:5432/nexa',
    'postgres://studio:p%40ssword@localhost/nexa?application_name=owner%20setup',
    'postgresql://studio:password@localhost/nexa?sslmode=allow',
  ]) {
    assert.equal(normalizeDatabaseUrl(value), value)
  }
})

test('invalid database URLs produce a generic error without exposing credentials', () => {
  const username = 'fixture-' + randomUUID()
  const password = randomUUID()
  let genericMessage: string | undefined
  for (const value of [
    `postgresql://${username}:${password}@`,
    `postgresql://${username}:${password}@localhost:invalid/nexa?sslmode=require`,
    `https://${username}:${password}@localhost/nexa?sslmode=require`,
    'not a database URL',
  ]) {
    assert.throws(() => normalizeDatabaseUrl(value), (error: unknown) => {
      assert.ok(error instanceof Error)
      const details = inspect(error)
      assert.ok(!details.includes(username))
      assert.ok(!details.includes(password))
      assert.ok(!details.includes(value))
      assert.ok(error.message.trim().length > 0)
      genericMessage ??= error.message
      assert.equal(error.message, genericMessage)
      return true
    })
  }
})
