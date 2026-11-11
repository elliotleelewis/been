import { atom } from "jotai";
import { unwrap } from "jotai/utils";

import maplibreStylesUrl from "maplibre-gl/dist/maplibre-gl.css?url";

/** The page's link to MapLibre's stylesheet, added the first time it is asked for. */
const linkMaplibreStyles = (): HTMLLinkElement => {
	const { document } = globalThis;
	const linked = [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].find(
		(link) => link.getAttribute("href") === maplibreStylesUrl,
	);
	if (linked !== undefined) {
		return linked;
	}
	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = maplibreStylesUrl;
	document.head.append(link);
	return link;
};

/**
 * Settles once a stylesheet has loaded, or failed to: the globe is better drawn without MapLibre's
 * styles than not drawn at all. Its events fire in a later task, so listening straight after the
 * link is added cannot miss them.
 */
const settled = async (link: HTMLLinkElement): Promise<boolean> => {
	if (link.sheet !== null) {
		return true;
	}
	const done = await new Promise<boolean>((resolve) => {
		link.addEventListener("load", () => {
			resolve(true);
		});
		link.addEventListener("error", () => {
			resolve(true);
		});
	});
	return done;
};

/**
 * Whether MapLibre's own stylesheet has loaded, which nothing but the globe uses. Imported for its
 * side effect, it would be linked in the page's head and hold up the loading screen's first paint,
 * for a globe that is not there yet. Instead it is linked the first time the globe is drawn, from
 * the preload the map page's head starts, and the map is not built until it has loaded: built
 * without it, the map sizes itself to an unstyled canvas, then resizes when the styles arrive. It
 * is false, rather than suspending, until then, so the rest of the page goes on without it.
 */
export const maplibreStylesLoadedAtom = unwrap(
	atom(async () => {
		const loaded = await settled(linkMaplibreStyles());
		return loaded;
	}),
	() => false,
);
