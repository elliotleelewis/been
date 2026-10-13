// Rasterises src/public/icon.svg into the PNGs the web app manifest and iOS ask for:
//
//   src/public/icon-192.png         - the manifest's small icon, and the one Android launchers use
//   src/public/icon-512.png         - the manifest's large icon, which splash screens are made from
//   src/public/apple-touch-icon.png - the home-screen icon on iOS, which reads no manifest icons
//
// Run it with `pnpm run generate:icons` after changing the SVG. Each PNG is drawn by Chromium, so
// it looks exactly like the SVG the browser tab shows.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const resolve = (path: string): string => fileURLToPath(new globalThis.URL(path, import.meta.url));

const SVG = readFileSync(resolve("../src/public/icon.svg"), "utf8");

const ICONS: readonly { readonly path: string; readonly size: number }[] = [
	{ path: "../src/public/icon-192.png", size: 192 },
	{ path: "../src/public/icon-512.png", size: 512 },
	{ path: "../src/public/apple-touch-icon.png", size: 180 },
];

const browser = await chromium.launch();
try {
	await Promise.all(
		ICONS.map(async ({ path, size }) => {
			const page = await browser.newPage({ viewport: { height: size, width: size } });
			await page.setContent(
				`<style>body { margin: 0 } svg { display: block; width: 100vw; height: 100vh }</style>${SVG}`,
			);
			await page.screenshot({ path: resolve(path) });
		}),
	);
} finally {
	await browser.close();
}
