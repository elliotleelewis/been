import type { Country } from "./country";
import type { M49Region } from "./m49";

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
