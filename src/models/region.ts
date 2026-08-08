import type { Country } from "./country";

export interface Region {
	readonly name: string;
	readonly values: readonly Country[];
	readonly complete?: number;
}
