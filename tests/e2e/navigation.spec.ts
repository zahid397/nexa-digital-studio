import { expect, test } from '@playwright/test'

const requiredRoutes = ['/', '/about', '/services', '/portfolio', '/contact']

test('mobile navigation covers Contact, traps focus and restores scroll at narrow widths', async ({ page }) => {
  for (const width of [360, 390, 768]) {
    await page.setViewportSize({ width, height: 780 })
    await page.goto('/contact')
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto'
      window.scrollTo(0, 200)
    })
    const previousScroll = await page.evaluate(() => window.scrollY)
    expect(previousScroll).toBe(200)
    const trigger = page.getByRole('button', { name: 'Open navigation', exact: true })
    await expect(trigger).toBeVisible()
    // Locator.click scrolls sticky targets into their original document position.
    // Click the already-visible control as a user would, without that scroll.
    const triggerBounds = await trigger.boundingBox()
    expect(triggerBounds).not.toBeNull()
    await page.mouse.click(
      triggerBounds!.x + triggerBounds!.width / 2,
      triggerBounds!.y + triggerBounds!.height / 2,
    )
    const dialog = page.getByRole('dialog', { name: 'Site navigation', exact: true })
    const menu = dialog.getByRole('navigation', { name: 'Mobile navigation', exact: true })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Close navigation' })).toBeFocused()
    for (const href of requiredRoutes) await expect(menu.locator(`a[href="${href}"]`)).toBeVisible()
    expect(await dialog.evaluate((element) => element.matches(':modal'))).toBe(true)
    // Measure final placement after the short opening transition completes.
    await expect.poll(async () => (await dialog.boundingBox())?.y).toBe(0)
    const bounds = await dialog.boundingBox()
    expect(bounds?.x).toBe(0)
    expect(bounds?.y).toBe(0)
    expect(bounds?.width).toBe(width)
    expect(bounds?.height).toBe(780)
    expect(await dialog.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe('rgb(17, 18, 24)')
    expect(await page.evaluate(() => document.body.style.position)).toBe('fixed')
    // A real native modal prevents programmatic focus on the underlying form.
    await page.locator('#name').evaluate((element) => (element as HTMLElement).focus())
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true)
    const links = dialog.locator('a')
    await links.last().focus()
    await page.keyboard.press('Tab')
    await expect(links.first()).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(links.last()).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
    expect(await page.evaluate(() => document.body.style.position)).not.toBe('fixed')
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - previousScroll)).toBeLessThanOrEqual(1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
  }
})

test('mobile navigation closes on destination, desktop resize and explicit dismissal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/contact')
  const trigger = page.getByRole('button', { name: 'Open navigation', exact: true })
  await trigger.click()
  let dialog = page.getByRole('dialog', { name: 'Site navigation', exact: true })
  expect(await dialog.evaluate((element) => getComputedStyle(element).animationName)).toBe('none')
  await dialog.getByRole('button', { name: 'Close navigation' }).click()
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await trigger.click()
  dialog = page.getByRole('dialog', { name: 'Site navigation', exact: true })
  await dialog.locator('nav a[href="/about"]').click()
  await expect(page).toHaveURL(/\/about$/)
  await expect(dialog).toHaveCount(0)
  expect(await page.evaluate(() => document.body.style.position)).not.toBe('fixed')
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
  await page.setViewportSize({ width: 1024, height: 844 })
  await expect(page.getByRole('dialog')).toHaveCount(0)
  const desktop = page.getByRole('navigation', { name: 'Main navigation', exact: true })
  for (const href of requiredRoutes) await expect(desktop.locator(`a[href="${href}"]`)).toBeVisible()
  expect(await page.evaluate(() => document.body.style.position)).not.toBe('fixed')
})

test('all public pages fit the additional 390px and 1024px acceptance widths', async ({ page }) => {
  for (const width of [390, 1024]) {
    await page.setViewportSize({ width, height: 950 })
    for (const route of requiredRoutes) {
      await page.goto(route)
      await expect(page.locator('h1')).toBeVisible()
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
        `${route} at ${width}px`,
      ).toBeLessThanOrEqual(1)
    }
  }
})
