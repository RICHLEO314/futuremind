import { defineConfig } from '@playwright/test'

export default defineConfig({
	timeout: 30_000,
	reporter: [['list']],
	use: {
		headless: true,
		trace: 'off',
	},
}) 