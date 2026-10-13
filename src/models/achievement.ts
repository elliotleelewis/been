import type { M49Region } from "./m49";

/** The kinds of achievement there are, each with a visa of its own colour and type. */
export type AchievementKind = "collection" | "geography" | "milestone" | "region" | "subregion";

/** One part of what an achievement asks for: at least `count` of `codes` ticked. */
export interface Requirement {
	readonly codes: readonly string[];
	readonly count: number;
}

/** Something a map can achieve, earned once every one of its requirements is met. */
export interface Achievement {
	/** Stable across releases, so a visa keeps its design and serial number. */
	readonly id: string;
	readonly kind: AchievementKind;
	readonly title: string;
	/** What it took, in a few words, beneath the title on its visa. */
	readonly description: string;
	readonly requirements: readonly Requirement[];
	/** The region a continent or sub-region achievement is for, whose ink its visa is printed in. */
	readonly region?: M49Region;
}

/** How an achievement's visa looks. The same achievement always gets the same design. */
export interface VisaDesign {
	readonly ink: string;
	/** What kind of visa it is, along its top, as a real visa names its category. */
	readonly type: string;
	/** How far the visa is turned, in degrees, as one stuck in by hand never sits quite square. */
	readonly rotation: number;
	readonly serial: string;
	/** Picks the guilloché pattern printed behind it, so no two visas share one. */
	readonly seed: number;
}

/** An achievement the map on show has earned, as a visa in its passport. */
export interface Visa {
	readonly achievement: Achievement;
	readonly design: VisaDesign;
	/**
	 * The day it was earned, as the reader writes dates: the day the tick that met its last
	 * requirement was made, or none where that tick is older than dates being kept.
	 */
	readonly date: string | undefined;
}

/** The width and height of a visa, in SVG units. */
export const VISA_WIDTH = 300;
export const VISA_HEIGHT = 190;

/** How many visas a page of the passport holds. */
export const VISAS_PER_PAGE = 2;

/** The category each kind of visa is printed with. */
export const VISA_TYPES: Readonly<Record<AchievementKind, string>> = {
	collection: "COLLECTION",
	geography: "GEOGRAPHIC",
	milestone: "MILESTONE",
	region: "CONTINENTAL",
	subregion: "REGIONAL",
};

/**
 * The ink of each kind of visa that belongs to no one region. Continent and sub-region visas take
 * their region's stamp ink instead, so they match the stamps that earned them.
 */
export const VISA_INKS: Readonly<Record<Exclude<AchievementKind, "region" | "subregion">, string>> =
	{
		collection: "#9c3d6b",
		geography: "#1d6f73",
		milestone: "#8a6d12",
	};

/** A visa moment: the visas a tick has just earned, played out once its stamp has landed. */
export interface VisaMoment {
	readonly ids: readonly string[];
	/** The stamp moment it follows, so a newer tick cuts it short. */
	readonly id: number;
}
