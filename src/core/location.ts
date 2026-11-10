import { atom } from "jotai";

import { countryCodesAtom } from "./dataset.ts";
import { decodeShare, shareValueOf } from "./share-link.ts";
import type { Visits } from "./types.ts";

/**
 * The hash of the location the router is at, as the app shell mirrors it from the router's history
 * (`src/app/location.ts`), so atoms can read it. The router owns the URL: nothing else writes this,
 * and anything that would change the URL navigates through the router instead.
 */
export const locationHashAtom = atom("");

/**
 * The map a share link opened the page on, or `null` when it opened on the reader's own. A link
 * marks countries by their place in the country list, so until the list has loaded, a shared map
 * shows empty rather than letting the reader's own show through first. A link this version cannot
 * read opens their own map, rather than an empty one that looks like theirs.
 */
export const sharedVisitsAtom = atom<Visits | null>((get) => {
	const value = shareValueOf(get(locationHashAtom));
	const codes = get(countryCodesAtom);
	if (value === undefined) {
		return null;
	}
	return codes.length === 0 ? {} : (decodeShare(value, codes) ?? null);
});

/** Whether a shared map is on show, which leaves nothing on screen that can change. */
export const viewingSharedMapAtom = atom((get) => get(sharedVisitsAtom) !== null);
