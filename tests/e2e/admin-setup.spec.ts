import { test, expect } from '@playwright/test'

test('completed owner setup keeps the first-user URL on the normal authenticated CMS flow', async ({
  page,
}) => {
  // The isolated test database has its administrator created by the owner CLI.
  // A first-user view override must not trap that administrator on setup forever.
  await page.goto('/admin/create-first-user')
  await expect(page).toHaveURL(/\/admin\/login(?:\?|$)/)
  await expect(page.getByLabel('Email', { exact: false })).toBeVisible()
  await expect(page.getByLabel('Password', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: /log in|login/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Create$/i })).toHaveCount(0)
})
