import type { M49Region, M49Subregion } from "./m49.ts";

/** A country as the dataset holds it: codes only, so that nothing in it is in any one language. */
export interface CountryData {
	readonly iso3166: string;
	readonly region: M49Region;
	readonly subregion: M49Subregion;
	readonly bounds?: readonly [number, number, number, number];
	/** The middle of its biggest piece of land, as a longitude and latitude. */
	readonly centre?: readonly [number, number];
	/** How much land it covers, in square kilometres. */
	readonly area?: number;
	/** The countries it shares a land border with, by code, as the atlas draws them, if any. */
	readonly neighbours?: readonly string[];
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

/** The kinds of achievement there are, each with a visa of its own colour and type. */
export type AchievementKind = "collection" | "geography" | "milestone" | "region" | "subregion";

/**
 * How rare an achievement is, which its visa shows: printed plain, with foil on its band and
 * medallion, or holographic all over.
 */
export type AchievementTier = "foil" | "legendary" | "standard";

/** One part of what an achievement asks for: at least `count` of `codes` ticked. */
export interface Requirement {
	readonly codes: readonly string[];
	readonly count: number;
	/** What this part asks for, where an achievement asks for more than one, such as a hemisphere. */
	readonly label?: string;
}

/** Something a map can achieve, earned once every one of its requirements is met. */
export interface Achievement {
	/** Stable across releases, so a visa keeps its design and serial number. */
	readonly id: string;
	readonly kind: AchievementKind;
	readonly tier: AchievementTier;
	readonly title: string;
	/** What it took, in a few words, beneath the title on its visa. */
	readonly description: string;
	readonly requirements: readonly Requirement[];
	/** The region a continent or sub-region achievement is for, whose ink its visa is printed in. */
	readonly region?: M49Region;
}

/** Which visited countries earned an achievement, as the back of its visa lists them. */
export interface Earners {
	/** For each of the achievement's requirements, in order, the countries ticked for it. */
	readonly requirements: readonly {
		/** The ones that met it, in the order they were ticked. */
		readonly earned: readonly string[];
		/** The rest of the visited ones it asks for, which it did not need, in the same order. */
		readonly extra: readonly string[];
	}[];
	/**
	 * The country whose tick met the last requirement, unless the achievement is not earned or that
	 * tick is older than dates being kept, when there is no telling which one it was.
	 */
	readonly clincher: string | undefined;
}

/** Why a country is worth visiting next. */
export type RecommendationReason =
	/** It is one of what an achievement not yet earned still asks for, `remaining` of them in all. */
	| { readonly kind: "achievement"; readonly achievement: Achievement; readonly remaining: number }
	/** It borders a country already visited, the latest of them if more than one. */
	| { readonly kind: "neighbour"; readonly neighbour: string }
	/** It is in a continent with no visits yet. */
	| { readonly kind: "region"; readonly region: M49Region };

/** A country worth visiting next, and why, the strongest reason first. */
export interface Recommendation {
	readonly code: string;
	readonly reasons: readonly RecommendationReason[];
}

/** Where the site's privacy policy is. */
export const PRIVACY_PATH = "/privacy";
/** Where the site says what it keeps on the reader's device. */
export const COOKIES_PATH = "/cookies";
