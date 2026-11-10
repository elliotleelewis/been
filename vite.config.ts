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
		// The site is static: no server runs it. Start renders every page to HTML when the site is
		// built, into dist/client/: the small print whole, and the map as its loading screen, as the map
		// itself is the reader's and renders only in the browser. Start's single-page app shell becomes
		// 404.html, which Cloudflare Pages serves with a 404 for any path the site has no file at, and
		// whose router then sends the reader home. Without a 404.html, Pages would answer such paths with
		// the map's page and a 200, passing it off as robots.txt, llms.txt or an ARD manifest. Tests
		// render components on their own, so they leave it out.
		mode === "test"
			? []
			: tanstackStart({
					pages: [{ path: "/" }, { path: "/privacy" }, { path: "/cookies" }],
					prerender: { autoStaticPathsDiscovery: false, crawlLinks: false, enabled: true },
					router: { entry: "app/router.tsx" },
					sitemap: { enabled: false },
					// The shell is rendered at the map's path, as one with no route would fail with a 404, but
					// with a query, as Start skips a path that is already in `pages`.
					spa: { enabled: true, maskPath: "/?shell", prerender: { outputPath: "/404" } },
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
