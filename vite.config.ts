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
		// itself is the reader's and renders only in the browser. An unknown path is served the map's
		// page by Cloudflare Pages, whose router then sends it home. Tests render components on their
		// own, so they leave it out.
		mode === "test"
			? []
			: tanstackStart({
					pages: [{ path: "/" }, { path: "/privacy" }, { path: "/cookies" }],
					prerender: { autoStaticPathsDiscovery: false, crawlLinks: false, enabled: true },
					router: { entry: "app/router.tsx" },
					sitemap: { enabled: false },
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
