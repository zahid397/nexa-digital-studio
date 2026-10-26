import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'
export async function up({ db }: MigrateUpArgs) {
  await db.execute(sql`CREATE TABLE contact_rate_limits (key TEXT PRIMARY KEY, hits INTEGER NOT NULL DEFAULT 1, expires_at TIMESTAMPTZ NOT NULL); CREATE INDEX contact_rate_limits_expiry ON contact_rate_limits (expires_at);`)
}
export async function down({ db }: MigrateDownArgs) {
  await db.execute(sql`DROP TABLE contact_rate_limits;`)
}
