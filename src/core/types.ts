import type { M49Region, M49Subregion } from "./m49.ts";

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
 * What is kept about a country the reader has been to, keyed by its ISO 3166-1 alpha-2 code. It is
 * an object so that details of the trip can be added later without changing how selections are
 * stored.
 */
export interface Visit {
	/**
	 * The day the country was ticked, as an ISO 8601 date such as "2026-10-13", which its passport
	 * stamp is dated with. Countries ticked before dates were kept, or opened from a share link, have
	 * none.
	 */
	readonly at?: string;
}
export type Visits = Readonly<Record<string, Visit>>;

/**
 * What the map's camera should do next.
 *
 * `country` frames a country the user has just selected, `undo` puts the camera back where it
 * was before that framing, so unselecting a country reverses the zoom it caused.
 */
export type Focus =
	| { readonly type: "country"; readonly country: Country }
	| { readonly type: "undo" };

/** A country that has just been stamped, which the stamp moment plays out for. */
export interface StampMoment {
	readonly code: string;
	/** Counts up with every stamp, so stamping the same country twice plays the moment twice. */
	readonly id: number;
}
