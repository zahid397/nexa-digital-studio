import assert from 'node:assert/strict'
import { test } from 'node:test'
import { inspect } from 'node:util'
import { randomUUID } from 'node:crypto'
import { normalizeDatabaseUrl } from '../src/lib/database-url'

function fixtureUrl(host: string, protocol = 'postgresql:') {
  const url = new URL(`${protocol}//${host}:5432/nexa`)
  url.username = 'fixture-' + randomUUID()
  url.password = randomUUID()
  return url
}

test('Neon pooled and direct connections upgrade legacy SSL modes to certificate verification', () => {
  for (const host of [
    'database-pooler.example.test',
    'database-direct.example.test',
  ]) {
    for (const mode of ['prefer', 'require', 'verify-ca']) {
      const original = fixtureUrl(host)
      original.searchParams.set('sslmode', mode)
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
  const original = fixtureUrl('database-pooler.example.test', 'postgres:')
  original.username = `${randomUUID()}@example.test`
  original.password = `${randomUUID()}:/#?%`
  original.pathname = '/studio%2Dreview'
  original.search = '?application_name=owner%20setup&sslmode=require&sslrootcert=%2Ftmp%2Ftrusted%20CA.pem&sslcert=%2Ftmp%2Fclient.pem&sslkey=%2Ftmp%2Fclient.key&channel_binding=require&options=-c%20statement_timeout%3D5000&tag=one&tag=two'
  const value = original.toString()
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
  for (const [host, protocol, search] of [
    ['verified.example.test', 'postgresql:', '?sslmode=verify-full&channel_binding=require'],
    ['local.example.test', 'postgres:', '?sslmode=disable'],
    ['local.example.test', 'postgresql:', ''],
    ['local.example.test', 'postgres:', '?application_name=owner%20setup'],
    ['local.example.test', 'postgresql:', '?sslmode=allow'],
  ] as const) {
    const fixture = fixtureUrl(host, protocol)
    fixture.search = search
    const value = fixture.toString()
    assert.equal(normalizeDatabaseUrl(value), value)
  }
})

test('invalid database URLs produce a generic error without exposing credentials', () => {
  const fixture = fixtureUrl('invalid.example.test')
  fixture.searchParams.set('sslmode', 'require')
  const { username, password } = fixture
  const wrongProtocol = fixtureUrl('invalid.example.test', 'https:')
  wrongProtocol.username = username
  wrongProtocol.password = password
  let genericMessage: string | undefined
  for (const value of [
    fixture.toString().replace(fixture.host, ''),
    fixture.toString().replace(`:${fixture.port}/`, ':invalid/'),
    wrongProtocol.toString(),
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
