import type { M49Region } from "../core/m49.ts";
import type { Country } from "../core/types.ts";

/** An M49 sub-region and the countries in it. */
export interface Region {
	readonly name: string;
	readonly values: readonly Country[];
	readonly complete?: number;
}

/** An M49 region, the continent-sized grouping the menu folds away, and the sub-regions in it. */
export interface Continent {
	readonly code: M49Region;
	readonly name: string;
	readonly values: readonly Region[];
	readonly visited: number;
	readonly total: number;
}

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

/**
 * How big the drawer is on each axis, as a fraction of the viewport. It is a column beside the
 * globe on wide screens and a sheet below it on narrow ones, so the two axes are kept apart:
 * rotating a phone or moving a window across a breakpoint should find the size that was chosen
 * for that shape, not the one chosen for the other. Fractions rather than pixels so a drawer
 * keeps its proportions when the window it was sized in is resized.
 */
export interface MenuSize {
	readonly height: number;
	readonly width: number;
}

export interface MenuBounds {
	readonly max: number;
	readonly min: number;
}

/**
 * How far the drawer may be dragged. The lower bounds keep enough of the list on screen to be
 * worth reading; the upper bound on width keeps the globe from being squeezed out, while a sheet
 * is allowed to cover it entirely, because "show me the whole list" is a state worth having.
 */
export const MENU_SIZE_BOUNDS: Readonly<Record<keyof MenuSize, MenuBounds>> = {
	height: { max: 1, min: 0.2 },
	width: { max: 0.6, min: 0.2 },
};

export const MENU_SIZE_DEFAULT: MenuSize = { height: 0.4, width: 1 / 3 };
