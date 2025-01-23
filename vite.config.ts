import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// biome-ignore lint/style/noDefaultExport: Required structure for Vite
export default defineConfig(({ command }) => ({
	root: './src',
	build: {
		outDir: '../dist',
		emptyOutDir: true,
		assetsDir: './',
		sourcemap: command === 'serve',
	},
	envDir: '../',
	plugins: [react(), tailwindcss()],
	optimizeDeps: {
		exclude: ['chromium-bidi', 'fsevents'],
	},
	test: {
		browser: {
			enabled: true,
			provider: 'playwright',
			name: 'chromium',
			headless: true,
			screenshotFailures: false,
		},
		coverage: {
			provider: 'istanbul',
			reportsDirectory: '../coverage',
			exclude: ['./index.tsx', '**/*.spec.{ts,tsx}'],
		},
		reporters: ['default', 'junit'],
		outputFile: '../reports/test.xml',
		exclude: ['**/__e2e-test__/**'],
		setupFiles: './vitest-setup.ts',
		clearMocks: true,
	},
}));
