import { defineConfig } from '@playwright/test'

export default defineConfig({
	timeout: 30_000,
	reporter: [['list']],
	testDir: 'e2e',
	testMatch: '**/*.e2e.ts',
	use: {
		headless: true,
		trace: 'off',
	},
}) 