// Rasterises src/public/icon.svg into the PNGs the web app manifest and iOS ask for, and
// src/public/social.svg into the picture link previews show, which have to be PNGs:
//
//   src/public/icon-192.png         - the manifest's small icon, and the one Android launchers use
//   src/public/icon-512.png         - the manifest's large icon, which splash screens are made from
//   src/public/apple-touch-icon.png - the home-screen icon on iOS, which reads no manifest icons
//   src/public/social.png           - the Open Graph image, at the 1200×630 previews are cropped from
//
// Run it with `pnpm run generate:icons` after changing either SVG. Each PNG is drawn by Chromium, so
// it looks exactly like the SVG the browser tab shows.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const resolve = (path: string): string => fileURLToPath(new globalThis.URL(path, import.meta.url));

const ICON = readFileSync(resolve("../src/public/icon.svg"), "utf8");
const SOCIAL = readFileSync(resolve("../src/public/social.svg"), "utf8");

const IMAGES: readonly {
	readonly height: number;
	readonly path: string;
	readonly svg: string;
	readonly width: number;
}[] = [
	{ height: 192, path: "../src/public/icon-192.png", svg: ICON, width: 192 },
	{ height: 512, path: "../src/public/icon-512.png", svg: ICON, width: 512 },
	{ height: 180, path: "../src/public/apple-touch-icon.png", svg: ICON, width: 180 },
	{ height: 630, path: "../src/public/social.png", svg: SOCIAL, width: 1200 },
];

const browser = await chromium.launch();
try {
	await Promise.all(
		IMAGES.map(async ({ height, path, svg, width }) => {
			const page = await browser.newPage({ viewport: { height, width } });
			await page.setContent(
				`<style>body { margin: 0 } svg { display: block; width: 100vw; height: 100vh }</style>${svg}`,
			);
			await page.screenshot({ path: resolve(path) });
		}),
	);
} finally {
	await browser.close();
}
