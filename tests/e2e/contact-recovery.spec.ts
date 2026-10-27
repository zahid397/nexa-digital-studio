import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'

test('contact service choices reflect published CMS services and preserve CTA selection', async ({
  page,
  request,
}) => {
  const response = await request.get('/api/services?where[_status][equals]=published&limit=100')
  expect(response.ok()).toBe(true)
  const services = (await response.json()).docs as { title: string; slug: string }[]
  expect(services).toHaveLength(6)
  await page.goto('/contact?service=cms-development')
  const select = page.getByRole('combobox', { name: 'What can we help with?' })
  await expect(select).toHaveValue('cms-development')
  await expect(select.locator('option')).toHaveCount(services.length + 1)
  for (const service of services)
    await expect(select.locator(`option[value="${service.slug}"]`)).toHaveText(service.title)
  await page.goto('/contact?service=unpublished-service')
  await expect(select).toHaveValue('')
})

// The response boundary is deliberately simulated here. Actual PostgreSQL
// persistence and private inbox access are covered by the existing studio suite.
test('contact preserves entered data and never claims success on an error or mismatched reference', async ({
  page,
}) => {
  const references: string[] = []
  let calls = 0
  await page.route('**/api/contact', async (route) => {
    references.push(route.request().postDataJSON().submissionId)
    calls++
    await route.fulfill({
      status: calls === 1 ? 503 : 200,
      contentType: 'application/json',
      body: JSON.stringify(
        calls === 1
          ? { message: 'The inquiry could not be saved. Please retry.' }
          : { reference: randomUUID() },
      ),
    })
  })
  await page.goto('/contact')
  await page.getByLabel('Your name', { exact: false }).fill('QA Recovery Reviewer')
  await page.getByLabel('Email address', { exact: false }).fill('recovery@example.test')
  await page.getByLabel('What can we help with?', { exact: false }).selectOption('cms-development')
  const message = 'Please preserve this unsent inquiry when the server cannot confirm persistence.'
  await page.getByLabel('A little about your project', { exact: false }).fill(message)
  const send = page.getByRole('button', { name: 'Send inquiry', exact: true })
  await send.click()
  await expect(page.locator('form.contact-form').getByRole('alert')).toContainText('could not be saved')
  await expect(page.getByRole('heading', { name: 'Good things start here.' })).toHaveCount(0)
  await expect(page.getByLabel('A little about your project', { exact: false })).toHaveValue(message)
  await expect(send).toBeEnabled()
  await send.click()
  await expect(page.locator('form.contact-form').getByRole('alert')).toContainText('did not confirm a saved inquiry')
  await expect(page.getByRole('heading', { name: 'Good things start here.' })).toHaveCount(0)
  expect(references).toHaveLength(2)
  expect(references[0]).toBe(references[1])
})

test('unpublished service choices show an explicit recovery state without losing the inquiry draft', async ({
  page,
  request,
}) => {
  const origin = { Origin: 'http://localhost:3000' }
  const login = await request.post('/api/users/login', {
    headers: origin,
    data: {
      email: process.env.INITIAL_ADMIN_EMAIL,
      password: process.env.INITIAL_ADMIN_PASSWORD,
    },
  })
  expect(login.ok()).toBe(true)
  const response = await request.get('/api/services?where[_status][equals]=published&limit=100')
  expect(response.ok()).toBe(true)
  const services = (await response.json()).docs as { id: number }[]
  expect(services).toHaveLength(6)
  try {
    for (const service of services)
      expect(
        (
          await request.patch(`/api/services/${service.id}`, {
            headers: origin,
            data: { _status: 'draft' },
          })
        ).ok(),
      ).toBe(true)
    await page.goto('/contact')
    await expect(page.getByText('Services are temporarily unavailable.', { exact: false })).toBeVisible()
    await expect(page.getByRole('combobox', { name: 'What can we help with?' })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Send inquiry', exact: true })).toBeDisabled()
    await page.getByLabel('Your name', { exact: false }).fill('QA Unsaved Draft')
  } finally {
    for (const service of services)
      expect(
        (
          await request.patch(`/api/services/${service.id}`, {
            headers: origin,
            data: { _status: 'published' },
          })
        ).ok(),
      ).toBe(true)
  }
  await page.getByRole('button', { name: 'Refresh services', exact: true }).click()
  await expect(page.getByRole('combobox', { name: 'What can we help with?' })).toBeEnabled()
  await expect(page.getByRole('combobox', { name: 'What can we help with?' }).locator('option')).toHaveCount(7)
  await expect(page.getByLabel('Your name', { exact: false })).toHaveValue('QA Unsaved Draft')
})
