import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { Users, Categories, Services, Projects, Inquiries } from '@/cms/collections'
import { SiteSettings, Home, About } from '@/cms/globals'
import { databaseDriver } from '@/lib/database-driver'
import { attachDatabasePool } from '@vercel/functions'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const secret = process.env.PAYLOAD_SECRET
if (!secret || secret.length < 32)
  throw new Error('PAYLOAD_SECRET must contain at least 32 characters.')
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.')

export default buildConfig({
  secret,
  admin: {
    user: 'users',
    meta: { titleSuffix: ' | Nexa Studio CMS' },
    importMap: { baseDir: dirname },
  },
  collections: [Users, Categories, Services, Projects, Inquiries],
  globals: [SiteSettings, Home, About],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pg: databaseDriver(),
    pool: {
      connectionString:
        process.env.PAYLOAD_MIGRATING === 'true'
          ? (process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL)
          : process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 15_000,
    },
    push: false,
    migrationDir: path.join(dirname, 'migrations'),
  }),
  typescript: { outputFile: path.join(dirname, 'payload-types.ts') },
  cors: [process.env.SITE_URL ?? 'http://localhost:3000'],
  csrf: [process.env.SITE_URL ?? 'http://localhost:3000'],
  graphQL: { disable: true },
  endpoints: [],
  telemetry: false,
  maxDepth: 2,
  onInit: async (payload) => {
    if (process.env.VERCEL && process.env.NEXA_NEON_WEBSOCKET !== 'true')
      attachDatabasePool(payload.db.pool)
  },
})
