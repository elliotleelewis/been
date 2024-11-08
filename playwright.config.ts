import { defineConfig } from '@playwright/test';

const URL_SERVE = 'http://127.0.0.1:5173';
const URL_PREVIEW = 'http://127.0.0.1:4173';
const URL = process.env['CI'] ? URL_PREVIEW : URL_SERVE;

// biome-ignore lint/style/noDefaultExport: Required structure for Playwright
export default defineConfig({
	testDir: './src/__e2e-test__',
	use: {
		// biome-ignore lint/style/useNamingConvention: Required structure for Playwright
		baseURL: URL,
		trace: 'on',
	},
	webServer: {
		command: 'pnpm run preview',
		url: process.env['CI']
			? 'http://127.0.0.1:4173'
			: 'http://127.0.0.1:5173',
		reuseExistingServer: !process.env['CI'],
		timeout: 10 * 1000,
	},
});
