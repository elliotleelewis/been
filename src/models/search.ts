import type { Country } from "./country";
import type { Continent } from "./region";

/** What a search of the country list found. */
export interface SearchResults {
	/** The search as it is compared, empty when there is nothing to search for. */
	readonly query: string;
	/** The continents narrowed to the countries that match, keeping the counts that describe them whole. */
	readonly continents: readonly Continent[];
	/** Every country that matches, in no particular order. */
	readonly matches: readonly Country[];
	/** Near misses to offer when nothing matches, nearest first. */
	readonly suggestions: readonly Country[];
}
