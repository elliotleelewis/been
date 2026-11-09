import { atom } from "jotai";

import { achievementsAtom, rawCountriesAtom } from "./dataset.ts";
import { viewingSharedMapAtom } from "./location.ts";
import { recommendationsOf } from "./recommendations.ts";
import { visitsAtom } from "./selection.ts";
import type { Recommendation } from "./types.ts";

/**
 * The countries the reader is recommended to visit next, best first, from their own map. A shared
 * map is someone else's, and there is nothing to recommend its reader from it.
 */
export const recommendationsAtom = atom<readonly Recommendation[]>((get) =>
	get(viewingSharedMapAtom)
		? []
		: recommendationsOf(
				Object.values(get(rawCountriesAtom)),
				get(visitsAtom),
				get(achievementsAtom),
			),
);

/** The codes of the countries recommended, for what only needs to mark them out. */
export const recommendedCodesAtom = atom<readonly string[]>((get) =>
	get(recommendationsAtom).map(({ code }) => code),
);
