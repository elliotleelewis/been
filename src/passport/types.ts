import type { M49Region } from "../core/m49.ts";
import type { Country } from "../core/types.ts";

/** The outlines a passport stamp can take. */
export type StampShape = "circle" | "octagon" | "oval" | "rectangle";

/** Every stamp shape, which a country's stamp is picked from by its code. */
export const STAMP_SHAPES: readonly [StampShape, ...StampShape[]] = [
	"circle",
	"oval",
	"rectangle",
	"octagon",
];

/** The words a stamp is marked with beneath the country's name, picked from by its code. */
export const STAMP_CAPTIONS: readonly [string, ...string[]] = [
	"ARRIVAL",
	"ENTRY",
	"ADMITTED",
	"ARRIVED",
];

/**
 * The ink each region's stamps are inked in, so a page fills with the mix of colours a well-used
 * passport has, and a run of stamps from one part of the world reads as one.
 */
export const STAMP_INKS: Readonly<Record<M49Region, string>> = {
	"002": "#2f7d4f",
	"009": "#a8591c",
	"019": "#1f5f9e",
	"142": "#b3302b",
	"150": "#4b3a8c",
};

/** How a country's stamp looks. The same country always gets the same design. */
export interface StampDesign {
	readonly shape: StampShape;
	readonly ink: string;
	/** How far the stamp is turned, in degrees, as one pressed by hand never lands square. */
	readonly rotation: number;
	readonly caption: string;
	/** How far the stamp sits off its place on the page, in pixels, across and down. */
	readonly offset: readonly [number, number];
	/** Seeds the speckle of the ink, so no two stamps wear the same way. */
	readonly seed: number;
}

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

/** A country's stamp in the passport. */
export interface PassportStamp {
	readonly country: Country;
	readonly design: StampDesign;
	/** The day the stamp is dated, as the reader writes dates, or none for an older tick. */
	readonly date: string | undefined;
	/** The country's outline as an SVG path in a 100-unit square, once the atlas has loaded. */
	readonly silhouette: string | undefined;
}

/** What the passport's identity page says about the map it belongs to. */
export interface PassportStats {
	readonly count: number;
	readonly total: number;
	/** How many of the M49 regions have at least one stamp. */
	readonly regions: number;
	/** The name of the reader's home region, where there is a guess at one. */
	readonly home: string | undefined;
	readonly first: string | undefined;
	readonly latest: string | undefined;
	/** How many achievements the map has earned a visa for, of how many there are. */
	readonly visas: number;
	readonly visaTotal: number;
}

/**
 * A page of the passport: the cover, the identity page, then its visas, if it has earned any, and
 * its stamps, a page of each numbered from 0 out of how many there are.
 */
export type PassportPage =
	| { readonly kind: "cover" }
	| { readonly kind: "identity" }
	| { readonly kind: "stamps"; readonly index: number; readonly of: number }
	| { readonly kind: "visas"; readonly index: number; readonly of: number };

/** How many stamps a page of the passport holds. */
export const STAMPS_PER_PAGE = 6;
