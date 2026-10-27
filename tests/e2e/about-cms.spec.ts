import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { loadTestEnvironment } from '../guard'
import type { About } from '../../src/payload-types'

// Refuse production endpoints even if this file is run separately from the suite.
loadTestEnvironment()

test('About edits stay private as drafts and appear publicly after CMS publication', async ({
  page,
  browser,
}) => {
  const origin = { Origin: 'http://localhost:3000' }
  await page.goto('/admin/login')
  await page.getByLabel('Email', { exact: false }).fill(process.env.INITIAL_ADMIN_EMAIL!)
  await page.getByLabel('Password', { exact: false }).fill(process.env.INITIAL_ADMIN_PASSWORD!)
  await page.getByRole('button', { name: /log in|login/i }).click()
  await expect(page).toHaveURL(/\/admin\/?$/)

  const publishedResponse = await page.context().request.get('/api/globals/about', {
    headers: origin,
  })
  expect(publishedResponse.ok()).toBe(true)
  const published = (await publishedResponse.json()) as About
  expect(published._status).toBe('published')
  const draftResponse = await page.context().request.get('/api/globals/about?draft=true', {
    headers: origin,
  })
  expect(draftResponse.ok()).toBe(true)
  const originalDraft = (await draftResponse.json()) as About
  const marker = `A considered publishing check ${randomUUID().slice(0, 8)}.`
  const anonymous = await browser.newPage()

  try {
    await page.goto('/admin/globals/about')
    await page.locator('#field-title').fill(marker)
    await page.getByRole('button', { name: /^Save Draft$/i }).click()
    await expect
      .poll(async () => {
        const response = await page.context().request.get('/api/globals/about?draft=true', {
          headers: origin,
        })
        expect(response.ok()).toBe(true)
        return (await response.json()).title
      })
      .toBe(marker)

    const privateDraft = await anonymous.request.get('/api/globals/about?draft=true')
    expect([401, 403]).toContain(privateDraft.status())
    await anonymous.goto('/about')
    await expect(anonymous.getByRole('heading', { level: 1 })).toHaveText(published.title)
    await expect(anonymous.getByRole('heading', { level: 1 })).not.toHaveText(marker)

    await page.getByRole('button', { name: /^Publish(?: Changes)?$/i }).click()
    await expect
      .poll(async () => {
        const response = await anonymous.request.get('/api/globals/about')
        expect(response.ok()).toBe(true)
        return (await response.json()).title
      })
      .toBe(marker)
    await anonymous.goto('/about')
    await anonymous.reload()
    await expect(anonymous.getByRole('heading', { level: 1 })).toHaveText(marker)
  } finally {
    // Restore only the edited field and publication state, leaving other content intact.
    try {
      const restoredPublished = await page.context().request.post('/api/globals/about', {
        headers: origin,
        data: { title: published.title, _status: published._status },
      })
      expect(restoredPublished.ok()).toBe(true)
      if (originalDraft._status === 'draft' || originalDraft.title !== published.title) {
        const restoredDraft = await page.context().request.post('/api/globals/about?draft=true', {
          headers: origin,
          data: { title: originalDraft.title, _status: originalDraft._status },
        })
        expect(restoredDraft.ok()).toBe(true)
      }
    } finally {
      await anonymous.close()
    }
  }
})
