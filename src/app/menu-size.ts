import { STORAGE_KEYS } from "../core/storage.ts";
import { MENU_SIZE_DEFAULT } from "../menu/types.ts";

/**
 * Sets the drawer's size on the page, as `--menu-height` and `--menu-width`, from where the reader
 * left it, before anything is painted. It runs as an inline script in the head of the map's page,
 * so the loading screen the build renders already has the drawer at the reader's size, and the app
 * taking over moves nothing. It reads storage as `menuSizeAtom` writes it, falls back to the default
 * size for anything missing or not a number, and rounds as the app does, so the two agree exactly.
 * It is source text, as it runs before any of the app has loaded.
 */
export const MENU_SIZE_SCRIPT = `(() => {
	let size;
	try {
		size = JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEYS.menuSize)}));
	} catch {}
	const style = document.documentElement.style;
	for (const [axis, fallback] of Object.entries(${JSON.stringify(MENU_SIZE_DEFAULT)})) {
		const value = typeof size?.[axis] === "number" ? size[axis] : fallback;
		style.setProperty("--menu-" + axis, Number((value * 100).toFixed(2)) + "%");
	}
})();`;
