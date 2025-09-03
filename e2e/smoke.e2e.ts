import { test, expect } from '@playwright/test'

test('smoke: page can open about:blank', async ({ page }) => {
	await page.goto('about:blank')
	expect(true).toBeTruthy()
}) 