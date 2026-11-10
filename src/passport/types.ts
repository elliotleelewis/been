import type { M49Region } from "../core/m49.ts";
import type { Achievement, AchievementKind, Country } from "../core/types.ts";

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

/** A country a locked visa still asks for, and whether it is one of those recommended next. */
export interface LockedVisaEntry {
	readonly country: Country;
	readonly recommended: boolean;
}

/** One of a locked visa's requirements still to meet, as its back lists the countries for it. */
export interface LockedVisaGroup {
	/** What it asks for, printed above it where the visa asks for more than one thing. */
	readonly label: string | undefined;
	/** How many more of its countries it needs. */
	readonly need: number;
	/** The countries not yet visited that would count, those recommended next first. */
	readonly open: readonly LockedVisaEntry[];
}

/**
 * An achievement the map on show is part of the way to, as a visa not yet issued: how many more
 * countries it needs, and which would do.
 */
export interface LockedVisa extends Visa {
	readonly remaining: number;
	readonly groups: readonly LockedVisaGroup[];
}

/** How many of the visas nearest to being earned the passport shows, locked, after those earned. */
export const LOCKED_VISA_COUNT = 4;

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

/** A country on the back of a visa, with the day it was ticked as the passport writes it. */
export interface VisaEntry {
	readonly country: Country;
	readonly date: string | undefined;
}

/** One of an achievement's requirements, as the back of its visa lists the countries for it. */
export interface VisaBackGroup {
	/** What it asks for, printed above it where the visa asks for more than one thing. */
	readonly label: string | undefined;
	/** The countries that met it, in the order they were ticked. */
	readonly earned: readonly VisaEntry[];
	/** The visited countries it did not need, which also count towards it. */
	readonly extra: readonly Country[];
}

/**
 * What the left of a visa's back shows: on the reader's own map, the stamp of the country whose tick
 * earned it, and a line saying what that tick was, or, where that tick is older than dates being
 * kept, that there is no telling which it was. A shared map carries no dates, so on one it shows how
 * the reader's own map stands on the visa instead: held too, on the day it was earned if there is
 * telling, or so many countries away, and which of the shared map's would do. Without a map of the
 * reader's own to set against it, it can only say that shared maps carry no dates.
 */
export type VisaBackSide =
	| { readonly kind: "clincher"; readonly stamp: PassportStamp; readonly caption: string }
	| { readonly kind: "undated" }
	| { readonly kind: "shared" }
	| { readonly kind: "held"; readonly date: string | undefined }
	| {
			readonly kind: "within";
			/** How many more countries the reader's own map needs for it. */
			readonly remaining: number;
			/** Countries on the shared map that would do, by name, as many as are needed. */
			readonly countries: readonly Country[];
	  };

/** What the back of a visa says: which countries earned it, and what its left side shows. */
export interface VisaBack {
	readonly side: VisaBackSide;
	readonly groups: readonly VisaBackGroup[];
}

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
	/**
	 * The country's outline as an SVG path in a 100-unit square, once the atlas has loaded: empty
	 * where the atlas draws it as no more than a point, as it does the Holy See.
	 */
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
 * A page of the passport: the cover, the identity page, then its visas, if it has earned any, those
 * within reach, if any are, and its stamps, a page of each numbered from 0 out of how many there are.
 */
export type PassportPage =
	| { readonly kind: "cover" }
	| { readonly kind: "identity" }
	| { readonly kind: "locked"; readonly index: number; readonly of: number }
	| { readonly kind: "stamps"; readonly index: number; readonly of: number }
	| { readonly kind: "visas"; readonly index: number; readonly of: number };

/** What the passport shows where it is open: its pages on show, and where it can turn to. */
export interface PassportOpening {
	/** Left to right: the cover alone, one page, or two facing, the right one blank if there is none. */
	readonly shown: readonly (PassportPage | null)[];
	/** Whether there are pages before and after those on show. */
	readonly turns: { readonly back: boolean; readonly forward: boolean };
}

/** A turn of the passport's pages. */
export interface PassportTurn {
	/** How many pages, or spreads where it lies open, forwards or, below 0, back. */
	readonly by: number;
	/** Whether it lies open two pages at a time. */
	readonly spread: boolean;
}

/** The parts of the passport after its identity page, which it can be opened straight at. */
export type PassportChapter = Extract<PassportPage, { readonly index: number }>["kind"];

/** A part of the passport, and the page it starts at. */
export interface PassportChapterStart {
	readonly chapter: PassportChapter;
	readonly page: number;
}

/** How many stamps a page of the passport holds. */
export const STAMPS_PER_PAGE = 6;
