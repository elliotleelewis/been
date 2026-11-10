import type { M49Region } from "../core/m49.ts";
import type { Country, Standing } from "../core/types.ts";

/** The search box at the top of the list, which the page's loading screen shows disabled. */
export const SEARCH_INPUT_CLASS_NAME =
	"w-full border-none bg-white px-4 py-2 text-zinc-900 focus:ring-2 focus:ring-primary/50 focus:ring-inset disabled:hover:cursor-not-allowed dark:bg-zinc-900 dark:text-white";

/** The drawer's handle, which the page's loading screen draws too, before it can be dragged. */
export const RESIZER_CLASS_NAME =
	"group flex shrink-0 cursor-row-resize touch-none select-none items-center justify-center bg-zinc-200 py-5 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-inset md:cursor-col-resize md:px-1 md:py-0 dark:bg-zinc-800";

/** The grip drawn on the drawer's handle. */
export const GRIP_CLASS_NAME =
	"h-1 w-10 rounded-full bg-zinc-400 transition-colors group-hover:bg-primary md:h-10 md:w-1 dark:bg-zinc-600";

/** An M49 sub-region and the countries in it. */
export interface Region {
	readonly name: string;
	readonly values: readonly Country[];
	readonly complete?: number;
	/** How much of it the reader's own map has, while a shared map is set against it. */
	readonly mine?: number | undefined;
}

/** An M49 region, the continent-sized grouping the menu folds away, and the sub-regions in it. */
export interface Continent {
	readonly code: M49Region;
	readonly name: string;
	readonly values: readonly Region[];
	readonly visited: number;
	readonly total: number;
	/** How many of its countries the reader's own map has, while a shared map is set against it. */
	readonly mine?: number | undefined;
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
	/** The standing the list is narrowed to, while a shared map is set against the reader's own. */
	readonly standing: Standing | null;
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
