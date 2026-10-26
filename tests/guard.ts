import fs from 'node:fs'
import { config as load, parse } from 'dotenv'
export function loadTestEnvironment() {
  if (!fs.existsSync('.env.test'))
    throw new Error('A separate .env.test is required. Tests never fall back to production.')
  load({ path: '.env.test', override: true, quiet: true })
  if (process.env.NEXA_TEST_DATABASE !== 'true')
    throw new Error('Set NEXA_TEST_DATABASE=true only for your isolated test database.')
  const test = new URL(process.env.DATABASE_URL!)
  if (fs.existsSync('.env')) {
    const production = parse(fs.readFileSync('.env'))
    if (
      production.DATABASE_URL &&
      new URL(production.DATABASE_URL).hostname.replace('-pooler.', '.') ===
        test.hostname.replace('-pooler.', '.')
    )
      throw new Error('Test and production endpoints match. Refusing to run.')
  }
  if (process.env.SITE_URL !== 'http://localhost:3000')
    throw new Error('Browser tests only run against the local isolated test application.')
}
