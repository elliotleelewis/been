import type { Position } from "geojson";

import { polygonsOf } from "./boundaries.ts";
import type { CountryBoundary } from "./boundaries.ts";

/** The Earth's mean radius, in kilometres. */
const EARTH_RADIUS_KM = 6371;
const RADIANS = Math.PI / 180;
const HALF_TURN_DEGREES = 180;

/** Each edge of a ring, as the point it starts from and the one it runs to. */
const edgesOf = (ring: readonly Position[]): readonly (readonly [Position, Position])[] =>
	ring.map((position, index) => [position, ring[(index + 1) % ring.length] ?? position]);

/** The area a ring encloses on the globe, in square kilometres, whichever way round it runs. */
const ringAreaOf = (ring: readonly Position[]): number =>
	Math.abs(
		(edgesOf(ring).reduce(
			(sum, [[longitude = 0, latitude = 0], [nextLongitude = 0, nextLatitude = 0]]) =>
				sum +
				(nextLongitude - longitude) *
					RADIANS *
					(2 + Math.sin(latitude * RADIANS) + Math.sin(nextLatitude * RADIANS)),
			0,
		) *
			EARTH_RADIUS_KM *
			EARTH_RADIUS_KM) /
			2,
	);

/** The land a polygon covers, in square kilometres: its outer ring less its holes. */
const polygonAreaOf = ([outer = [], ...holes]: readonly Position[][]): number =>
	ringAreaOf(outer) - holes.reduce((total, hole) => total + ringAreaOf(hole), 0);

/** The land a country covers, in square kilometres, across every part of it. */
export const landAreaOf = (boundary: CountryBoundary): number =>
	polygonsOf(boundary).reduce((total, polygon) => total + polygonAreaOf(polygon), 0);

/**
 * The centroid of a ring, as a longitude and latitude, or its first point where it encloses
 * nothing, as a country drawn as a single point does.
 */
const ringCentreOf = (ring: readonly Position[]): readonly [number, number] => {
	let twiceArea = 0;
	let longitudes = 0;
	let latitudes = 0;
	for (const [[longitude = 0, latitude = 0], [nextLongitude = 0, nextLatitude = 0]] of edgesOf(
		ring,
	)) {
		const cross = longitude * nextLatitude - nextLongitude * latitude;
		twiceArea += cross;
		longitudes += (longitude + nextLongitude) * cross;
		latitudes += (latitude + nextLatitude) * cross;
	}
	const [[firstLongitude = 0, firstLatitude = 0] = []] = ring;
	return twiceArea === 0
		? [firstLongitude, firstLatitude]
		: [longitudes / (3 * twiceArea), latitudes / (3 * twiceArea)];
};

/**
 * The middle of a country's biggest piece of land, as a longitude between -180 and 180 and a
 * latitude: where the country's land mostly is, rather than the middle of a box that may take in
 * islands an ocean away.
 */
export const centreOf = (boundary: CountryBoundary): readonly [number, number] => {
	const [[outer = []] = []] = polygonsOf(boundary).toSorted(
		(one, other) => polygonAreaOf(other) - polygonAreaOf(one),
	);
	const [longitude, latitude] = ringCentreOf(outer);
	return [longitude > HALF_TURN_DEGREES ? longitude - 2 * HALF_TURN_DEGREES : longitude, latitude];
};
