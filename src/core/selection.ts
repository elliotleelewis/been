import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import { sharedVisitsAtom } from "./location.ts";
import { persistStorageAtom } from "./persistence.ts";
import { validatedStorage } from "./storage.ts";
import type { Focus, Visits } from "./types.ts";
import { isVisits } from "./visits.ts";

const COUNTRIES_STORAGE_KEY = "APP_COUNTRIES";

/** The visits as local storage holds them, cleared if not in today's shape. */
const storedVisitsAtom = atomWithStorage<Visits>(
	COUNTRIES_STORAGE_KEY,
	{},
	validatedStorage(isVisits),
	{ getOnInit: true },
);

/**
 * The countries the reader has been to. Writing them also asks the browser to keep the site's
 * storage, since from then on the reader has a map to lose.
 */
export const visitsAtom = atom(
	(get) => get(storedVisitsAtom),
	(_get, set, visits: Visits) => {
		set(storedVisitsAtom, visits);
		set(persistStorageAtom);
	},
);

/** What the map's camera should do next, if anything has asked it to move. */
export const focusAtom = atom<Focus | null>(null);

/**
 * The visits on show: a shared map's while a share link is open, otherwise the reader's own. Only
 * the reader's own are ever written to, so opening someone else's map cannot touch them.
 */
export const shownVisitsAtom = atom<Visits>((get) => get(sharedVisitsAtom) ?? get(visitsAtom));

/** The codes of the countries on show as visited, which the globe fills in. */
export const selectedCountriesAtom = atom<readonly string[]>((get) =>
	Object.keys(get(shownVisitsAtom)),
);
