import { SHARE_PARAM } from "../core/share-link.ts";
import { STORAGE_KEYS } from "../core/storage.ts";
import { MENU_SIZE_DEFAULT } from "../menu/types.ts";

/**
 * Readies the map's page from what only the reader's browser knows, before anything is painted. It
 * runs as an inline script in the page's head, so the loading screen the build renders already
 * looks as the app will, and the app taking over moves nothing:
 *
 * - The drawer's size, as `--menu-height` and `--menu-width`, from where the reader left it. It reads
 *   storage as `menuSizeAtom` writes it, falls back to the default size for anything missing or not
 *   a number, and rounds as the app does, so the two agree exactly.
 * - `data-shared-map` on the root element when the page opened on a share link, which has no sharing
 *   for the loading screen to show.
 *
 * It is source text, as it runs before any of the app has loaded.
 */
export const BEFORE_PAINT_SCRIPT = `(() => {
	const root = document.documentElement;
	let size;
	try {
		size = JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEYS.menuSize)}));
	} catch {}
	for (const [axis, fallback] of Object.entries(${JSON.stringify(MENU_SIZE_DEFAULT)})) {
		const value = typeof size?.[axis] === "number" ? size[axis] : fallback;
		root.style.setProperty("--menu-" + axis, Number((value * 100).toFixed(2)) + "%");
	}
	if (new URLSearchParams(location.hash.slice(1)).has(${JSON.stringify(SHARE_PARAM)})) {
		root.dataset.sharedMap = "";
	}
})();`;
