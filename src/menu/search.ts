import { atom } from "jotai";

import { comparisonAtom } from "../core/comparison.ts";
import { countriesAtom, localesAtom } from "../core/countries.ts";
import { stampCountryAtom } from "../core/ticking.ts";
import type { Standing } from "../core/types.ts";
import { continentsAtom } from "./continents.ts";
import { bestMatchesOf, foldText, suggestionsFor } from "./matching.ts";
import type { Continent, SearchResults } from "./types.ts";

/** How many near misses to offer when a search matches nothing. */
const MAX_SUGGESTIONS = 5;

/** What the reader has typed into the search box. */
export const searchAtom = atom("");

/**
 * The standing the reader has narrowed the list to, while a shared map is set against their own,
 * or none, for every country.
 */
export const standingFilterAtom = atom<Standing | null>(null);

/** The standing the list is narrowed to: none unless a comparison is on show to narrow it by. */
const shownStandingAtom = atom<Standing | null>((get) =>
	get(comparisonAtom) === null ? null : get(standingFilterAtom),
);

/** The codes of the countries the list is narrowed to by standing, or none, to keep every one. */
const keptCodesAtom = atom<ReadonlySet<string> | undefined>((get) => {
	const standing = get(shownStandingAtom);
	const comparison = get(comparisonAtom);
	return standing === null || comparison === null ? undefined : new Set(comparison[standing]);
});

/** Keeps only the countries in `codes`, and drops whatever is left empty. */
const narrow = (
	continents: readonly Continent[],
	codes: ReadonlySet<string>,
): readonly Continent[] =>
	continents
		.map((continent): Continent => ({
			code: continent.code,
			mine: continent.mine,
			name: continent.name,
			total: continent.total,
			values: continent.values
				.map((region) => ({
					complete: region.complete ?? 0,
					mine: region.mine,
					name: region.name,
					values: region.values.filter(({ iso3166 }) => codes.has(iso3166)),
				}))
				.filter((region) => region.values.length > 0),
			visited: continent.visited,
		}))
		.filter((continent) => continent.values.length > 0);

/**
 * The countries a search finds: the best tier of matches, or failing any match at all, near misses
 * to offer in their place. While a shared map is set against the reader's own, it finds only those
 * of the standing the list is narrowed to, if it is.
 */
export const searchResultsAtom = atom<SearchResults>((get) => {
	const locales = get(localesAtom);
	const continents = get(continentsAtom);
	const query = foldText(get(searchAtom), locales);
	const standing = get(shownStandingAtom);
	const kept = get(keptCodesAtom);
	if (query === "") {
		return {
			continents: kept === undefined ? continents : narrow(continents, kept),
			matches: [],
			query,
			standing,
			suggestions: [],
		};
	}

	const countries = get(countriesAtom).filter(
		({ iso3166 }) => kept === undefined || kept.has(iso3166),
	);
	const matches = bestMatchesOf(countries, query, locales);
	return {
		continents: narrow(continents, new Set(matches.map(({ iso3166 }) => iso3166))),
		matches,
		query,
		standing,
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
