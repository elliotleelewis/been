import { GLOBE_MIN_ZOOM } from "./types.ts";

/** How fast the globe turns: a whole turn every two minutes, in degrees of longitude a millisecond. */
const DEGREES_PER_MS = 360 / 120_000;
/** The closest the camera can be for the globe to turn, so a country being looked at stays put. */
export const MAX_SPIN_ZOOM = 2.6;
/**
 * How fast the camera pulls back out while the globe turns: from the closest it turns at to the
 * whole world in the time the globe turns through a twelfth of a turn, so it keeps pace with it.
 */
const ZOOM_PER_MS = (MAX_SPIN_ZOOM - GLOBE_MIN_ZOOM) / (30 / DEGREES_PER_MS);
/** The latitude the camera comes back to as the globe turns: the equator, where it opens. */
const HOME_LATITUDE = 0;

/** Moves `value` towards `target` by at most `step`, landing on it rather than overshooting. */
const towards = (value: number, target: number, step: number): number =>
	value + Math.max(-step, Math.min(step, target - value));

/** Where the camera looks from, as the map takes it. */
export interface SpunCamera {
	readonly center: [number, number];
	readonly zoom: number;
}

/**
 * The camera `elapsed` milliseconds further into the globe's idle turn, from looking at `center`
 * from `zoom`: turned further west to east, and that much further back to where the globe opens,
 * out to the whole world and over the equator, at the pace it turns, so it all moves as one.
 */
export const spunCameraOf = (
	[longitude, latitude]: readonly [number, number],
	zoom: number,
	elapsed: number,
): SpunCamera => ({
	center: [
		longitude - DEGREES_PER_MS * elapsed,
		towards(latitude, HOME_LATITUDE, DEGREES_PER_MS * elapsed),
	],
	zoom: towards(zoom, GLOBE_MIN_ZOOM, ZOOM_PER_MS * elapsed),
});
