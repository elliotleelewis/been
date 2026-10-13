import { atom } from "jotai";
import { unwrap } from "jotai/utils";

import { loadAtlas } from "../data/atlas.ts";
import { EMPTY_BOUNDARIES, toBoundaries } from "../data/boundaries.ts";
import type { CountryBoundaries } from "../data/boundaries.ts";
import type { CountryData } from "../models/country.ts";

/** The country list, keyed by ISO 3166-1 alpha-2 code, empty until it has loaded. */
export const rawCountriesAtom = atom<Readonly<Record<string, CountryData>>>({});

/**
 * Every country's code, sorted, which is the order a share link marks countries in. It is empty
 * until the country list has loaded.
 */
export const countryCodesAtom = atom<readonly string[]>((get) =>
	Object.keys(get(rawCountriesAtom)).toSorted(),
);

/**
 * The country boundaries the globe and the passport both draw from, fetched and built once. Until
 * they land, and should the atlas fail to load, there are none.
 */
export const boundariesAtom = unwrap(
	atom(async (): Promise<CountryBoundaries> => {
		try {
			return toBoundaries(await loadAtlas());
		} catch (cause) {
			console.error("Failed to load country boundaries.", cause);
			return EMPTY_BOUNDARIES;
		}
	}),
	() => EMPTY_BOUNDARIES,
);
