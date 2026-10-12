import type { M49Region, M49Subregion } from "./m49";

/** A country as the dataset holds it: codes only, so that nothing in it is in any one language. */
export interface CountryData {
	readonly iso3166: string;
	readonly region: M49Region;
	readonly subregion: M49Subregion;
	readonly bounds?: readonly [number, number, number, number];
}

/** A country as the app shows it, named in the reader's language. */
export interface Country extends CountryData {
	readonly name: string;
	readonly selected?: boolean;
}

/**
 * What is kept about a country the reader has been to, keyed by its ISO 3166-1 alpha-2 code. A
 * visit has no details yet; it is an object so that details of the trip can be added later without
 * changing how selections are stored.
 */
export type Visit = Readonly<Record<string, never>>;
export type Visits = Readonly<Record<string, Visit>>;
