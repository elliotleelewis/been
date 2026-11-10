import { atom } from "jotai";

import { comparisonAtom } from "./comparison.ts";
import { achievementsAtom, rawCountriesAtom } from "./dataset.ts";
import { viewingSharedMapAtom } from "./location.ts";
import { recommendationsOf } from "./recommendations.ts";
import { visitsAtom } from "./selection.ts";
import type { Recommendation } from "./types.ts";

/**
 * The countries the reader is recommended to visit next, best first, from their own map. While a
 * shared map is set against it, they are picked from the countries on the shared map that are new
 * to the reader, so it says which of someone else's trips to follow. A shared map on its own is
 * someone else's, and there is nothing to recommend its reader from it.
 */
export const recommendationsAtom = atom<readonly Recommendation[]>((get) => {
	const comparison = get(comparisonAtom);
	if (get(viewingSharedMapAtom) && comparison === null) {
		return [];
	}
	return recommendationsOf({
		achievements: get(achievementsAtom),
		among: comparison === null ? undefined : new Set(comparison.theirs),
		countries: Object.values(get(rawCountriesAtom)),
		visits: get(visitsAtom),
	});
});

/** The codes of the countries recommended, for what only needs to mark them out. */
export const recommendedCodesAtom = atom<readonly string[]>((get) =>
	get(recommendationsAtom).map(({ code }) => code),
);
