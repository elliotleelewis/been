import { atom } from "jotai";

import type { Continent } from "../models/region.ts";
import type { SearchResults } from "../models/search.ts";
import { bestMatchesOf, foldText, suggestionsFor } from "../utils/search.ts";
import { continentsAtom, countriesAtom, localesAtom } from "./atoms.ts";
import { stampCountryAtom } from "./stamping.ts";

/** How many near misses to offer when a search matches nothing. */
const MAX_SUGGESTIONS = 5;

/** What the reader has typed into the search box. */
export const searchAtom = atom("");

/** Keeps only the countries in `codes`, and drops whatever is left empty. */
const narrow = (
	continents: readonly Continent[],
	codes: ReadonlySet<string>,
): readonly Continent[] =>
	continents
		.map((continent): Continent => ({
			code: continent.code,
			name: continent.name,
			total: continent.total,
			values: continent.values
				.map((region) => ({
					complete: region.complete ?? 0,
					name: region.name,
					values: region.values.filter(({ iso3166 }) => codes.has(iso3166)),
				}))
				.filter((region) => region.values.length > 0),
			visited: continent.visited,
		}))
		.filter((continent) => continent.values.length > 0);

/**
 * The countries a search finds: the best tier of matches, or failing any match at all, near misses
 * to offer in their place.
 */
export const searchResultsAtom = atom<SearchResults>((get) => {
	const locales = get(localesAtom);
	const continents = get(continentsAtom);
	const query = foldText(get(searchAtom), locales);
	if (query === "") {
		return { continents, matches: [], query, suggestions: [] };
	}

	const countries = get(countriesAtom);
	const matches = bestMatchesOf(countries, query, locales);
	return {
		continents: narrow(continents, new Set(matches.map(({ iso3166 }) => iso3166))),
		matches,
		query,
		suggestions:
			matches.length > 0 ? [] : suggestionsFor(countries, query, locales).slice(0, MAX_SUGGESTIONS),
	};
});

/**
 * Enter in the search box. When the search has found exactly one country, it ticks it and clears
 * the search, so a run of countries can be typed one after another. A near miss is never ticked
 * this way, as a guess at what was meant is not the reader asking for it.
 */
export const submitSearchAtom = atom(undefined, (get, set) => {
	const { matches } = get(searchResultsAtom);
	const [match] = matches;
	if (matches.length !== 1 || match === undefined) {
		return;
	}
	set(stampCountryAtom, match.iso3166);
	set(searchAtom, "");
});
