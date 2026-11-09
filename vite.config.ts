import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
	build: {
		assetsDir: "./",
		emptyOutDir: true,
		outDir: "../dist",
		// The app, and the pages of its small print, which Cloudflare Pages serves at /privacy and
		// /cookies.
		rolldownOptions: {
			input: {
				cookies: `${import.meta.dirname}/src/cookies.html`,
				index: `${import.meta.dirname}/src/index.html`,
				privacy: `${import.meta.dirname}/src/privacy.html`,
			},
		},
		sourcemap: command === "serve",
	},
	envDir: "../",
	optimizeDeps: {
		exclude: ["chromium-bidi", "fsevents"],
	},
	plugins: [
		// Compiles messages/ into typed functions in src/paraglide/. English is the only language so
		// far. Keep the strategy in step with `prepare` in package.json.
		// Vite's root is src/, so both paths are anchored to this file rather than left relative.
		paraglideVitePlugin({
			outdir: `${import.meta.dirname}/src/paraglide`,
			project: `${import.meta.dirname}/project.inlang`,
			strategy: ["preferredLanguage", "baseLocale"],
		}),
		react({ compiler: true }),
		tailwindcss(),
	],
	root: "./src",
	test: {
		browser: {
			enabled: true,
			headless: true,
			instances: [{ browser: "chromium" }],
			provider: playwright(),
			screenshotFailures: false,
		},
		clearMocks: true,
		coverage: {
			exclude: ["./index.tsx", "./privacy.tsx", "./cookies.tsx", "**/*.spec.{ts,tsx}"],
			provider: "istanbul",
			reportsDirectory: "../coverage",
		},
		exclude: ["**/__e2e-test__/**"],
		outputFile: "../reports/test.xml",
		reporters: ["default", "junit"],
		setupFiles: "./vitest-setup.ts",
	},
}));
