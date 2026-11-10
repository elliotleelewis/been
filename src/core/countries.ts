import { atom } from "jotai";

import { standingsAtom } from "./comparison.ts";
import { rawCountriesAtom } from "./dataset.ts";
import { shownVisitsAtom } from "./selection.ts";
import type { Country, Standing } from "./types.ts";

/**
 * The languages the reader prefers, most preferred first, which every name and ordering follows.
 */
export const localesAtom = atom<readonly string[]>(globalThis.navigator.languages);

const countryNamesAtom = atom((get) => new Intl.DisplayNames(get(localesAtom), { type: "region" }));

/** Compares names as the reader's language sorts them. */
export const collatorAtom = atom((get) => new Intl.Collator(get(localesAtom)));

/** A country's standing in the comparison on show, as a field to spread in, if it has one. */
const standingOf = (
	standings: ReadonlyMap<string, Standing>,
	code: string,
): Pick<Country, "standing"> => {
	const standing = standings.get(code);
	return standing === undefined ? {} : { standing };
};

/**
 * Every country, named in the reader's language and marked if it is on show as visited, and, while a
 * shared map is set against the reader's own, with where it stands between them.
 */
export const countriesAtom = atom<readonly Country[]>((get) => {
	const rawCountries = get(rawCountriesAtom);
	const visits = get(shownVisitsAtom);
	const countryNames = get(countryNamesAtom);
	const standings = get(standingsAtom);

	// Spread into a new object rather than mutating `country`. Mutating it in place would keep
	// the same object identity, so `memo`'d consumers such as `MenuItem` would never re-render.
	// oxlint-disable-next-line no-map-spread -- The in-place mutation it suggests is what the new object identity is avoiding.
	return Object.values(rawCountries).map((country) => ({
		...country,
		name: countryNames.of(country.iso3166) ?? country.iso3166,
		selected: Object.hasOwn(visits, country.iso3166),
		...standingOf(standings, country.iso3166),
	}));
});
