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
		environment: 'jsdom',
		coverage: {
			reportsDirectory: '../coverage',
		},
	},
}));
