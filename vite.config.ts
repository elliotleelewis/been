import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vite";

export default defineConfig(({ command, mode }) => ({
	build: {
		emptyOutDir: true,
		// Anchored to this file, as Start reads it from where the build runs rather than from the root.
		outDir: `${import.meta.dirname}/dist`,
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
		// The site is static: no server runs it. Start renders the document shell, which the map fills
		// in in the browser, and the small print, which has nothing of the reader's in it, to HTML when
		// the site is built, all of it into dist/client/. Tests render components on their own, so
		// they leave it out.
		mode === "test"
			? []
			: tanstackStart({
					pages: [{ path: "/privacy" }, { path: "/cookies" }],
					prerender: { autoStaticPathsDiscovery: false, crawlLinks: false, enabled: true },
					router: { entry: "app/router.tsx" },
					sitemap: { enabled: false },
					spa: { enabled: true, prerender: { outputPath: "/index" } },
					// Vite's root is src/ already.
					srcDirectory: ".",
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
			exclude: ["./client.tsx", "./routeTree.gen.ts", "**/*.spec.{ts,tsx}"],
			provider: "istanbul",
			reportsDirectory: "../coverage",
		},
		exclude: ["**/__e2e-test__/**"],
		outputFile: "../reports/test.xml",
		reporters: ["default", "junit"],
		setupFiles: "./vitest-setup.ts",
	},
}));
