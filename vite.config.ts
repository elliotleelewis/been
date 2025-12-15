import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
	build: {
		assetsDir: "./",
		emptyOutDir: true,
		outDir: "../dist",
		sourcemap: command === "serve",
	},
	envDir: "../",
	optimizeDeps: {
		exclude: ["chromium-bidi", "fsevents"],
	},
	plugins: [react(), tailwindcss()],
	root: "./src",
	test: {
		browser: {
			enabled: true,
			headless: true,
			provider: playwright(),
			screenshotFailures: false,
			instances: [{ browser: "chromium" }],
		},
		clearMocks: true,
		coverage: {
			exclude: ["./index.tsx", "**/*.spec.{ts,tsx}"],
			provider: "istanbul",
			reportsDirectory: "../coverage",
		},
		exclude: ["**/__e2e-test__/**"],
		outputFile: "../reports/test.xml",
		reporters: ["default", "junit"],
		setupFiles: "./vitest-setup.ts",
	},
}));
