import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
	root: './src',
	build: {
		outDir: '../dist',
		emptyOutDir: true,
		assetsDir: './',
		sourcemap: command === 'serve',
	},
	envDir: '../',
	plugins: [react()],
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
			exclude: ['./index.tsx'],
		},
		setupFiles: './vitest-setup.ts',
		clearMocks: true,
	},
}));
