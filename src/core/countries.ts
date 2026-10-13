import { atom } from "jotai";

import { rawCountriesAtom } from "./dataset.ts";
import { shownVisitsAtom } from "./selection.ts";
import type { Country } from "./types.ts";

/**
 * The languages the reader prefers, most preferred first, which every name and ordering follows.
 */
export const localesAtom = atom<readonly string[]>(globalThis.navigator.languages);

const countryNamesAtom = atom((get) => new Intl.DisplayNames(get(localesAtom), { type: "region" }));

/** Compares names as the reader's language sorts them. */
export const collatorAtom = atom((get) => new Intl.Collator(get(localesAtom)));

/** Every country, named in the reader's language and marked if it is on show as visited. */
export const countriesAtom = atom<readonly Country[]>((get) => {
	const rawCountries = get(rawCountriesAtom);
	const visits = get(shownVisitsAtom);
	const countryNames = get(countryNamesAtom);

	// Spread into a new object rather than mutating `country`. Mutating it in place would keep
	// the same object identity, so `memo`'d consumers such as `MenuItem` would never re-render.
	// oxlint-disable-next-line no-map-spread -- The in-place mutation it suggests is what the new object identity is avoiding.
	return Object.values(rawCountries).map((country) => ({
		...country,
		name: countryNames.of(country.iso3166) ?? country.iso3166,
		selected: Object.hasOwn(visits, country.iso3166),
	}));
});
