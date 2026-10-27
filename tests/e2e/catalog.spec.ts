import { test, expect } from '@playwright/test'

test('all six published service details render their CMS content and inquiry links', async ({ page, request }) => {
  const response = await request.get('/api/services?limit=100')
  expect(response.ok()).toBe(true)
  const services = (await response.json()).docs as { title: string; slug: string; ctaLabel: string }[]
  expect(services).toHaveLength(6)
  for (const service of services) {
    const result = await page.goto(`/services/${service.slug}`)
    expect(result?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(service.title)
    await expect(page.locator('.deliverables li').first()).toBeVisible()
    await expect(page.getByRole('link', { name: service.ctaLabel, exact: true })).toHaveAttribute(
      'href', `/contact?service=${encodeURIComponent(service.slug)}`,
    )
  }
})

test('all six fictional portfolio details render valid project images and case studies', async ({ page, request }) => {
  const response = await request.get('/api/projects?limit=100')
  expect(response.ok()).toBe(true)
  const projects = (await response.json()).docs as { title: string; slug: string; imageAlt: string; isDemo: boolean }[]
  expect(projects).toHaveLength(6)
  for (const project of projects) {
    expect(project.isDemo).toBe(true)
    const result = await page.goto(`/portfolio/${project.slug}`)
    expect(result?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(project.title)
    await expect(page.getByText('Self-initiated fictional work.', { exact: false })).toBeVisible()
    const cover = page.locator('.project-cover img')
    await expect(cover).toHaveAttribute('alt', project.imageAlt)
    await expect.poll(() => cover.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
    await expect(page.getByRole('heading', { name: 'The solution', exact: true })).toBeVisible()
  }
})
