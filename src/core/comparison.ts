import { atom } from "jotai";

import { compareVisits, standingsOf } from "./compare.ts";
import { countryCodesAtom } from "./dataset.ts";
import { openedVisitsAtom, sharedVisitsAtom } from "./location.ts";
import { visitsAtom } from "./selection.ts";
import type { Comparison, Standing } from "./types.ts";

/**
 * A shared map set against the reader's own, while one is on show. There is nothing to compare with
 * until the reader has a map of their own, so until then there is none.
 */
export const comparisonAtom = atom<Comparison | null>((get) => {
	const theirs = get(sharedVisitsAtom);
	const mine = get(visitsAtom);
	if (theirs === null || Object.keys(mine).length === 0) {
		return null;
	}
	return compareVisits(theirs, mine, get(countryCodesAtom));
});

/** Each country's standing in the comparison on show, by its code, empty when there is none. */
export const standingsAtom = atom<ReadonlyMap<string, Standing>>((get) => {
	const comparison = get(comparisonAtom);
	return comparison === null ? new Map() : standingsOf(comparison);
});

/**
 * The reader's own map set against the last shared map they opened, on show or not, for a reply to
 * say how the two compare. There is none until the reader has a map of their own, nor when the two
 * are the same map, as when the reader opens a link to their own.
 */
export const replyComparisonAtom = atom<Comparison | null>((get) => {
	const theirs = get(openedVisitsAtom);
	const mine = get(visitsAtom);
	if (theirs === null || Object.keys(mine).length === 0) {
		return null;
	}
	const comparison = compareVisits(theirs, mine, get(countryCodesAtom));
	return comparison.mine.length === 0 && comparison.theirs.length === 0 ? null : comparison;
});
