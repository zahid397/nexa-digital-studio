import { createHash, createHmac } from 'node:crypto'
import { sql } from '@payloadcms/db-postgres'
import { NextResponse, type NextRequest } from 'next/server'
import { cms } from '@/lib/cms'
import { contactSchema } from '@/lib/contact'

export const runtime = 'nodejs'
export const maxDuration = 30
export const dynamic = 'force-dynamic'
const json = (data: object, status: number, headers?: HeadersInit) =>
  NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store', ...headers } })

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  const expectedOrigin = process.env.SITE_URL
    ? new URL(process.env.SITE_URL).origin
    : new URL(request.url).origin
  if (!origin || origin !== expectedOrigin)
    return json({ message: 'Please submit this form from the website.' }, 403)
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    return json({ message: 'Unsupported request format.' }, 415)
  // Count actual streamed bytes. A caller-controlled Content-Length is insufficient.
  const reader = request.body?.getReader()
  if (!reader) return json({ message: 'The request is empty.' }, 400)
  let size = 0
  const chunks: Uint8Array[] = []
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 24_000) {
        await reader.cancel()
        return json({ message: 'Your message is too large.' }, 413)
      }
      chunks.push(value)
    }
    const raw: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    const result = contactSchema.safeParse(raw)
    if (!result.success)
      return json(
        {
          message: 'Please check the highlighted fields.',
          fieldErrors: result.error.flatten().fieldErrors,
        },
        422,
      )
    const { website, submissionId, ...fields } = result.data
    if (website)
      return json(
        { message: 'We could not accept this submission. Please leave the website field empty.' },
        422,
      )
    const payload = await cms()
    const fingerprint = createHash('sha256').update(JSON.stringify(fields)).digest('hex')
    const previous = await payload.find({
      collection: 'inquiries',
      overrideAccess: true,
      where: { submissionId: { equals: submissionId } },
      limit: 1,
    })
    if (previous.docs[0]) {
      if (previous.docs[0].fingerprint !== fingerprint)
        return json(
          {
            message:
              'This reference belongs to a different message. Reload the page to start a new inquiry.',
          },
          409,
        )
      return json(
        { message: 'Your inquiry has been saved in our studio inbox.', reference: submissionId },
        200,
      )
    }
    const address = process.env.VERCEL
      ? (request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown')
      : 'local-development'
    const hour = Math.floor(Date.now() / 3_600_000)
    const key = createHmac('sha256', process.env.PAYLOAD_SECRET!)
      .update(address + ':' + hour)
      .digest('hex')
    const limited = await payload.db.drizzle.execute(
      sql`INSERT INTO contact_rate_limits (key, hits, expires_at) VALUES (${key}, 1, NOW() + INTERVAL '2 hours') ON CONFLICT (key) DO UPDATE SET hits = contact_rate_limits.hits + 1 RETURNING hits`,
    )
    const hits = Number(limited.rows[0]?.hits)
    if (!Number.isFinite(hits) || hits > 5)
      return json(
        { message: 'Too many inquiries in a short time. Please try again in an hour.' },
        429,
        { 'Retry-After': '3600' },
      )
    await payload.db.drizzle.execute(sql`DELETE FROM contact_rate_limits WHERE expires_at < NOW()`)
    const services = await payload.find({
      collection: 'services',
      overrideAccess: false,
      where: { and: [{ slug: { equals: fields.service } }, { _status: { equals: 'published' } }] },
      limit: 1,
    })
    if (!services.docs[0])
      return json(
        {
          message: 'Please select an available service.',
          fieldErrors: {
            service: ['This service is no longer available. Please refresh and choose another.'],
          },
        },
        422,
      )
    try {
      await payload.create({
        collection: 'inquiries',
        overrideAccess: true,
        data: {
          ...fields,
          service: services.docs[0].title,
          fingerprint,
          submissionId,
          status: 'new',
        },
      })
    } catch (error) {
      const duplicate = await payload.find({
        collection: 'inquiries',
        overrideAccess: true,
        where: { submissionId: { equals: submissionId } },
        limit: 1,
      })
      if (!duplicate.docs[0] || duplicate.docs[0].fingerprint !== fingerprint) throw error
    }
    return json(
      { message: 'Your inquiry has been saved in our studio inbox.', reference: submissionId },
      201,
    )
  } catch (error) {
    if (error instanceof SyntaxError)
      return json({ message: 'The request could not be read. Please try again.' }, 400)
    console.error(
      'Contact inquiry could not be saved.',
      error instanceof Error ? error.name : 'UnknownError',
    )
    return json(
      {
        message:
          'We could not save your inquiry right now. Your message is still here. Please retry.',
      },
      503,
    )
  }
}
