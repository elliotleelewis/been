import { SHARE_PARAM } from "../core/share-link.ts";

/**
 * Marks the map's page with `data-shared-map` on its root element when it opened on a share link,
 * before anything is painted, as only the reader's browser sees the link's fragment. The loading
 * screen the build renders then leaves out the sharing icon, which a shared map has no button for,
 * and the app taking over changes nothing. It runs as an inline script in the page's head, so it is
 * source text, as it runs before any of the app has loaded.
 */
export const BEFORE_PAINT_SCRIPT = `if (new URLSearchParams(location.hash.slice(1)).has(${JSON.stringify(SHARE_PARAM)})) {
	document.documentElement.dataset.sharedMap = "";
}`;
