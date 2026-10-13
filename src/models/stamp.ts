import type { M49Region } from "./m49";

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
