import type { Country } from "../models/country";

/**
 * How closely a country matches a search, lower being closer: 1 for its ISO 3166-1 alpha-2 code or
 * the start of one of the words in its name, 2 for somewhere inside its name.
 */
export type MatchTier = 1 | 2;

/**
 * Text as it is compared: lower case in the reader's language, with accents taken off, so "sao"
 * finds São Tomé, and every run of anything but letters and digits made a single space, so
 * "cote d'ivoire" finds "Côte d’Ivoire" with its typographic apostrophe.
 */
export const foldText = (text: string, locales: readonly string[]): string =>
	text
		.normalize("NFD")
		.replaceAll(/\p{M}/gu, "")
		.toLocaleLowerCase(locales)
		.replaceAll(/[^\p{L}\p{N}]+/gu, " ")
		.trim();

/** Splits text into what a reader would count as its letters, however many code points each takes. */
const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });
const lettersOf = (text: string): readonly string[] =>
	Array.from(graphemes.segment(text), ({ segment }) => segment);

/** A folded name from each of its words to its end: "united kingdom", then "kingdom". */
const tailsOf = (name: string): readonly string[] => {
	const words = name.split(" ");
	return words.map((_word, index) => words.slice(index).join(" "));
};

/** How well a country matches a folded search, or `undefined` when it does not match at all. */
export const matchTierOf = (
	country: Country,
	query: string,
	locales: readonly string[],
): MatchTier | undefined => {
	const name = foldText(country.name, locales);
	if (
		country.iso3166.toLowerCase() === query ||
		tailsOf(name).some((tail) => tail.startsWith(query))
	) {
		return 1;
	}
	return name.includes(query) ? 2 : undefined;
};

/** The distances between the start of one string and the start of another, as an edit distance fills them in. */
type Grid = number[][];

const cellOf = (grid: Grid, row: number, column: number): number => grid[row]?.[column] ?? 0;

/**
 * The distance between the first `row` letters of `left` and the first `column` of `right`, from
 * the cells before it: one more than a deletion or an insertion, a substitution if the letters
 * differ, or one more than a swap if the last two letters are the same pair the other way round.
 */
const nextCell = (
	grid: Grid,
	[left, right]: readonly [readonly string[], readonly string[]],
	[row, column]: readonly [number, number],
): number => {
	const cost = left[row - 1] === right[column - 1] ? 0 : 1;
	const swapped =
		row > 1 &&
		column > 1 &&
		left[row - 1] === right[column - 2] &&
		left[row - 2] === right[column - 1];
	return Math.min(
		cellOf(grid, row - 1, column) + 1,
		cellOf(grid, row, column - 1) + 1,
		cellOf(grid, row - 1, column - 1) + cost,
		swapped ? cellOf(grid, row - 2, column - 2) + 1 : Number.POSITIVE_INFINITY,
	);
};

/**
 * The fewest single-letter insertions, deletions, substitutions or swaps of two neighbouring
 * letters that turn one string into the other. Counting a swap as one edit, rather than two, is
 * what makes "gemrany" as near to "germany" as "germnay" is.
 */
export const editDistance = (one: string, other: string): number => {
	const letters = [lettersOf(one), lettersOf(other)] as const;
	const [left, right] = letters;
	// Against an empty start of either string, the distance is the length of the other so far.
	const grid: Grid = Array.from({ length: left.length + 1 }, (_row, row) =>
		Array.from({ length: right.length + 1 }, (_cell, column) =>
			row === 0 || column === 0 ? row + column : 0,
		),
	);
	for (const [row, cells] of grid.entries()) {
		for (const column of cells.keys()) {
			if (row > 0 && column > 0) {
				cells[column] = nextCell(grid, letters, [row, column]);
			}
		}
	}
	return cellOf(grid, left.length, right.length);
};

/**
 * How many typos a search of this length may hold and still suggest a country. Short searches get
 * none, as a letter or two from almost anything is a letter or two from almost everything.
 */
export const typoAllowanceOf = (query: string): number => {
	const { length } = lettersOf(query);
	if (length <= 2) {
		return 0;
	}
	return length <= 5 ? 1 : 2;
};

/**
 * How many typos away a folded search is from the start of any of the words in a country's name.
 * It is measured against the start of a word rather than the whole of it, so a search still being
 * typed, such as "swtiz", is as near to "Switzerland" as the finished word would be.
 */
export const typoDistanceOf = (
	country: Country,
	query: string,
	locales: readonly string[],
): number => {
	const { length } = lettersOf(query);
	return Math.min(
		...tailsOf(foldText(country.name, locales)).flatMap((tail) => {
			const letters = lettersOf(tail);
			return [length - 1, length, length + 1].map((size) =>
				editDistance(query, letters.slice(0, size).join("")),
			);
		}),
	);
};

/**
 * The countries that match a folded search at the best tier any of them reaches, so a worse tier
 * only shows when every better one is empty: "fr" finds France, and not "South Africa" too.
 */
export const bestMatchesOf = (
	countries: readonly Country[],
	query: string,
	locales: readonly string[],
): readonly Country[] => {
	const tiers = countries.map((country) => matchTierOf(country, query, locales));
	const best = Math.min(...tiers.map((tier) => tier ?? Number.POSITIVE_INFINITY));
	return countries.filter((_country, index) => tiers[index] === best);
};

/** The countries within a folded search's typo allowance of it, nearest first. */
export const suggestionsFor = (
	countries: readonly Country[],
	query: string,
	locales: readonly string[],
): readonly Country[] => {
	const allowance = typoAllowanceOf(query);
	return countries
		.map((country) => ({ country, distance: typoDistanceOf(country, query, locales) }))
		.filter(({ distance }) => distance <= allowance)
		.toSorted((one, other) => one.distance - other.distance)
		.map(({ country }) => country);
};
