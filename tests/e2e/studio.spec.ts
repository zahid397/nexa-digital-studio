import { test, expect, request as apiRequest, type Page } from '@playwright/test'
import { randomUUID } from 'node:crypto'

async function login(page: Page) {
  await page.goto('/admin/login')
  await page.getByLabel('Email', { exact: false }).fill(process.env.INITIAL_ADMIN_EMAIL!)
  await page.getByLabel('Password', { exact: false }).fill(process.env.INITIAL_ADMIN_PASSWORD!)
  await page.getByRole('button', { name: /log in|login/i }).click()
  await expect(page).toHaveURL(/\/admin\/?$/)
}
test('Home, Services, Portfolio, About and Contact navigation', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Good ideas.')
  await page.getByRole('link', { name: 'Start a project', exact: true }).click()
  await expect(page).toHaveURL(/\/contact$/)
  await page
    .getByRole('navigation', { name: 'Main navigation', exact: true })
    .getByRole('link', { name: 'Services', exact: true })
    .click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('The whole picture')
  await expect(page.getByRole('heading', { name: 'CMS Development', exact: true })).toBeVisible()
  await page
    .getByRole('navigation', { name: 'Main navigation', exact: true })
    .getByRole('link', { name: 'Work', exact: true })
    .click()
  await expect(page).toHaveURL(/\/portfolio$/)
  await expect(page.locator('.project-card')).toHaveCount(6)
  await page.getByRole('button', { name: 'Commerce', exact: true }).click()
  await expect(page.locator('.project-card')).toHaveCount(2)
  await page.getByRole('button', { name: /All work/ }).click()
  await page.getByRole('link', { name: 'View Orbit project', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Orbit')
  await page
    .getByRole('navigation', { name: 'Main navigation', exact: true })
    .getByRole('link', { name: 'About', exact: true })
    .click()
  await expect(
    page.getByText('Illustrative profiles created for this agency demonstration.', {
      exact: false,
    }),
  ).toBeVisible()
  await expect(page.locator('.team-grid article')).toHaveCount(3)
  expect(errors).toEqual([])
})
test('mobile hamburger, keyboard dismissal and touch navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const toggle = page.getByRole('button', { name: 'Open navigation' })
  await toggle.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toHaveCount(0)
  await expect(toggle).toBeFocused()
  await toggle.click()
  await page
    .getByRole('navigation', { name: 'Mobile navigation' })
    .getByRole('link', { name: /Services/ })
    .click()
  await expect(page).toHaveURL(/\/services$/)
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toHaveCount(0)
})
test('responsive layouts have no horizontal overflow', async ({ page }) => {
  for (const width of [360, 768, 1440])
    for (const route of ['/', '/about', '/services', '/portfolio', '/contact']) {
      await page.setViewportSize({ width, height: 950 })
      await page.goto(route)
      await expect(page.locator('h1')).toBeVisible()
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow, `${route} at ${width}px`).toBeLessThanOrEqual(1)
    }
})
test('administrator can log in through the actual Payload UI', async ({ page }) => {
  await login(page)
  await expect(page.getByRole('link', { name: 'Projects', exact: true }).first()).toBeVisible()
})
test('administrator creates a draft, publishes it and sees it publicly after refresh', async ({
  page,
  browser,
}) => {
  const slug = 'qa-browser-' + randomUUID()
  const title = 'Browser publishing ' + slug.slice(-6)
  const anon = await browser.newPage()
  await login(page)
  await page.goto('/admin/collections/projects/create')
  for (const [label, value] of [
    ['Title', title],
    ['Slug', slug],
    ['Summary', 'A real CMS publishing flow test.'],
    ['Image Alt', 'A fictional test project mockup'],
    ['Overview', 'A real database-backed test overview.'],
    ['Challenge', 'A publishing and access-control check.'],
    ['Solution', 'A project published through the Payload administration UI.'],
  ])
    await page.getByLabel(label, { exact: false }).first().fill(value)
  await page.locator('#field-category').click()
  await page.getByText('Digital products', { exact: true }).last().click()
  await page.getByRole('button', { name: /^Save Draft$/i }).click()
  await expect(page).toHaveURL(/\/admin\/collections\/projects\/\d+$/)
  await expect(page.getByRole('button', { name: /^Save Draft$/i })).toBeDisabled()
  await expect
    .poll(async () => {
      const r = await page
        .context()
        .request.get(`/api/projects?where[slug][equals]=${slug}&draft=true`, {
          headers: { Origin: 'http://localhost:3000' },
        })
      return (await r.json()).totalDocs
    })
    .toBe(1)
  await anon.goto(`/portfolio/${slug}`)
  await expect(anon.getByRole('heading', { level: 1 })).not.toHaveText(title)
  await page.getByRole('button', { name: /^Publish changes$/i }).click()
  await expect
    .poll(async () => {
      const r = await anon.request.get(`/api/projects?where[slug][equals]=${slug}`)
      return (await r.json()).totalDocs
    })
    .toBe(1)
  await anon.goto(`/portfolio/${slug}`)
  await anon.reload()
  await expect(anon.getByRole('heading', { level: 1 })).toHaveText(title)
  const doc = (
    await (
      await page.context().request.get(`/api/projects?where[slug][equals]=${slug}`, {
        headers: { Origin: 'http://localhost:3000' },
      })
    ).json()
  ).docs[0]
  const removed = await page
    .context()
    .request.delete(`/api/projects/${doc.id}`, { headers: { Origin: 'http://localhost:3000' } })
  expect(removed.ok()).toBe(true)
  await anon.close()
})
test('editing the homepage in CMS changes the public page', async ({ page, browser }) => {
  await login(page)
  const r = await page.context().request.get('/api/globals/home', {
    headers: { Origin: 'http://localhost:3000' },
  })
  const home = await r.json()
  const marker = 'A different kind of studio.'
  const anon = await browser.newPage()
  try {
    await page.goto('/admin/globals/home')
    await page.getByLabel('Hero Title', { exact: false }).fill(marker)
    await page.getByRole('button', { name: /^Publish(?: Changes)?$/i }).click()
    await expect
      .poll(async () => {
        const r = await anon.request.get('/api/globals/home')
        return (await r.json()).heroTitle
      })
      .toBe(marker)
    await anon.goto('/')
    await anon.reload()
    await expect(anon.getByRole('heading', { level: 1 })).toContainText(marker)
  } finally {
    const restored = await page.context().request.post('/api/globals/home', {
      headers: { Origin: 'http://localhost:3000' },
      data: { heroTitle: home.heroTitle, _status: 'published' },
    })
    expect(restored.ok()).toBe(true)
    await anon.close()
  }
})
test('accessible contact validation and a persisted inquiry visible in CMS', async ({ page }) => {
  await page.goto('/contact')
  await page.getByRole('button', { name: 'Send inquiry', exact: true }).click()
  await expect(page.locator('.error-summary')).toBeFocused()
  await expect(page.locator('#email')).toHaveAttribute('aria-invalid', 'true')
  const name = 'QA Inquiry ' + randomUUID().slice(0, 6)
  await page.getByLabel('Your name', { exact: false }).fill(name)
  await page.getByLabel('Email address', { exact: false }).fill('reviewer@example.test')
  await page.getByLabel('What can we help with?', { exact: false }).selectOption('cms-development')
  await page
    .getByLabel('A little about your project', { exact: false })
    .fill('Please review this isolated, database-persisted demonstration inquiry.')
  await page.getByRole('button', { name: 'Send inquiry', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Good things start here.' })).toBeVisible()
  await expect(
    page.getByText('Your inquiry is saved in the studio’s private inbox.', { exact: false }),
  ).toBeVisible()
  await login(page)
  await page.goto('/admin/collections/inquiries')
  await page.getByRole('link', { name, exact: true }).click()
  await expect(page).toHaveURL(/\/admin\/collections\/inquiries\/\d+$/)
  await expect(page.locator('#field-email')).toHaveValue('reviewer@example.test')
})
test('anonymous administrative operations and public first-user registration are denied', async ({
  request,
}) => {
  for (const path of [
    '/api/users',
    '/api/inquiries',
    '/api/projects/versions',
    '/api/globals/home?draft=true',
  ])
    expect([401, 403]).toContain((await request.get(path)).status())
  expect(
    (
      await request.post('/api/users/first-register', {
        data: { email: 'attack@example.test', password: randomUUID() },
      })
    ).status(),
  ).toBe(403)
  expect([401, 403]).toContain(
    (await request.post('/api/projects', { data: { title: 'Unauthorised' } })).status(),
  )
  expect(
    (
      await request.post('/api/contact', { headers: { Origin: 'https://evil.example' }, data: {} })
    ).status(),
  ).toBe(403)
})
test('contact idempotency, spam rejection and excessive-submission limits', async () => {
  const request = await apiRequest.newContext({
    baseURL: 'http://localhost:3000',
    extraHTTPHeaders: { Origin: 'http://localhost:3000' },
  })
  const data = {
    name: 'API Reviewer',
    email: 'api@example.test',
    service: 'web-development',
    message: 'A genuine isolated contact API test with sufficient detail.',
    submissionId: randomUUID(),
  }
  const first = await request.post('/api/contact', { data })
  expect(first.status()).toBe(201)
  expect((await request.post('/api/contact', { data })).status()).toBe(200)
  expect(
    (
      await request.post('/api/contact', {
        data: {
          ...data,
          message: 'A changed message that must conflict with the original reference.',
        },
      })
    ).status(),
  ).toBe(409)
  expect(
    (
      await request.post('/api/contact', {
        data: { ...data, submissionId: randomUUID(), website: 'spam.example' },
      })
    ).status(),
  ).toBe(422)
  let limited = false
  for (let i = 0; i < 6; i++) {
    const r = await request.post('/api/contact', { data: { ...data, submissionId: randomUUID() } })
    if (r.status() === 429) {
      limited = true
      break
    }
    expect(r.status()).toBe(201)
  }
  expect(limited).toBe(true)
  await request.dispose()
})
test('public screenshots and reduced-motion preference', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('.orbital-system')).toHaveCSS('animation-name', 'none')
  await expect(page.locator('.hero-copy > div').first()).toHaveCSS('opacity', '1')
  await page.locator('img').evaluateAll(async (images) => {
    await Promise.all(
      images.map(async (image) => {
        if (!(image instanceof HTMLImageElement)) return
        image.loading = 'eager'
        await image.decode()
      }),
    )
  })
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true })
  await page.goto('/contact')
  await expect(page.locator('.site-header')).toBeVisible()
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.screenshot({ path: 'test-results/contact-mobile.png', fullPage: true })
})
