import { atom } from "jotai";

import { countryCodesAtom } from "./dataset.ts";
import { decodeShare, shareValueOf } from "./share-link.ts";
import type { Visits } from "./types.ts";

/** The hash of the location the router is at, which `locationHashAtom` reads and writes. */
const hashAtom = atom("");

/**
 * What the last share link the reader opened carries, kept for the rest of the visit after they
 * leave it, so they can come back to compare once they have a map of their own. It is only ever
 * in memory: a map someone sent the reader is not stored on their device.
 */
export const openedShareValueAtom = atom<string | null>(null);

/**
 * The hash of the location the router is at, as the app shell mirrors it from the router's history
 * (`src/app/location.ts`), so atoms can read it. The router owns the URL: nothing else writes this,
 * and anything that would change the URL navigates through the router instead. Writing a share
 * link's hash also remembers its map as the one the reader opened.
 */
export const locationHashAtom = atom(
	(get) => get(hashAtom),
	(_get, set, hash: string) => {
		set(hashAtom, hash);
		const value = shareValueOf(hash);
		if (value !== undefined) {
			set(openedShareValueAtom, value);
		}
	},
);

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

/**
 * The map the last share link the reader opened carries, whether or not it is on show, or `null`
 * when they have opened none, or none this version can read.
 */
export const openedVisitsAtom = atom<Visits | null>((get) => {
	const value = get(openedShareValueAtom);
	const codes = get(countryCodesAtom);
	return value === null || codes.length === 0 ? null : (decodeShare(value, codes) ?? null);
});
