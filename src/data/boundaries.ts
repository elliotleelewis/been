import type { FeatureCollection, MultiPolygon, Polygon, Position } from "geojson";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";

import { boundaryCodes } from "./boundary-codes.ts";

export interface BoundaryProperties {
	readonly iso_3166_1: string;
}

export type CountryBoundaries = FeatureCollection<Polygon | MultiPolygon, BoundaryProperties>;
export type CountryBoundary = CountryBoundaries["features"][number];
/**
 * West, south, east, north. A country that straddles the antimeridian has an east edge past 180,
 * such as Fiji's [177, -21, 182, -12], which MapLibre frames as one box across the date line.
 */
export type Bounds = readonly [number, number, number, number];

export const EMPTY_BOUNDARIES: CountryBoundaries = { features: [], type: "FeatureCollection" };

/**
 * Natural Earth draws a country and its overseas territories as a single shape, so France reaches
 * from Guadeloupe to Réunion and the Netherlands into the Caribbean. For the countries whose
 * territories the app does not list separately, the camera should frame the home landmass, which
 * is where it went when those territories were features of their own. Everywhere else the whole
 * shape is the right frame: Spain's Canaries and Portugal's Azores have no ISO 3166-1 code of
 * their own, so they belong inside their country's bounds.
 */
const HOME_LANDMASS_ONLY: ReadonlySet<string> = new Set(["FR", "NL", "NO"]);

/**
 * How far apart two parts of a country may sit and still count as one landmass. Wide enough to
 * hold Corsica onto France, narrow enough to leave Réunion off it.
 */
const LANDMASS_GAP_DEGREES = 2;

const TURN_DEGREES = 360;

/** A longitude moved by whole turns to sit within half a turn of `near`. */
const besideLongitude = (longitude: number, near: number): number =>
	longitude + TURN_DEGREES * Math.round((near - longitude) / TURN_DEGREES);

/** A ring with each longitude moved by whole turns to sit within half a turn of the one before. */
const continuousRing = (ring: readonly Position[]): Position[] => {
	const continuous: Position[] = [];
	for (const [longitude = 0, ...rest] of ring) {
		const previous = continuous.at(-1)?.[0];
		continuous.push([
			previous === undefined ? longitude : besideLongitude(longitude, previous),
			...rest,
		]);
	}
	return continuous;
};

/** A ring moved by whole turns, so its first longitude sits within half a turn of `near`. */
const ringBeside = (ring: readonly Position[], near: number): Position[] => {
	const shift = besideLongitude(ring[0]?.[0] ?? near, near) - (ring[0]?.[0] ?? near);
	return ring.map(([longitude = 0, ...rest]) => [longitude + shift, ...rest]);
};

/**
 * A polygon with no edge running the long way round the globe. The atlas is drawn for d3, which
 * joins points along the sphere, so an island across the antimeridian, such as Wrangel Island in
 * Russia or Vanua Levu in Fiji, has neighbouring points at 179.9 and -179.9. MapLibre joins points
 * along the flat map, where those two are a world apart, and draws that edge as a band round the
 * whole globe. Carried on past 180 instead, the outline stays where it is, and MapLibre draws a
 * shape that runs past 180 across the antimeridian. A polygon that never crosses is left as it is.
 */
export const continuousPolygon = (polygon: readonly Position[][]): Position[][] => {
	const [outer = [], ...holes] = polygon.map((ring) => continuousRing(ring));
	const west = Math.min(...outer.map(([longitude = 0]) => longitude));
	const anchored = west < -180 ? ringBeside(outer, (outer[0]?.[0] ?? 0) + TURN_DEGREES) : outer;
	const near = anchored[0]?.[0] ?? 0;
	return [anchored, ...holes.map((hole) => ringBeside(hole, near))];
};

const polygonsOf = (boundary: CountryBoundary): readonly Position[][][] =>
	(boundary.geometry.type === "Polygon"
		? [boundary.geometry.coordinates]
		: boundary.geometry.coordinates
	).map((polygon) => continuousPolygon(polygon));

const extend = (bounds: Bounds, position: Position): Bounds => {
	const [longitude, latitude] = position;
	return longitude === undefined || latitude === undefined
		? bounds
		: [
				Math.min(bounds[0], longitude),
				Math.min(bounds[1], latitude),
				Math.max(bounds[2], longitude),
				Math.max(bounds[3], latitude),
			];
};

const EMPTY_BOUNDS: Bounds = [180, 90, -180, -90];

const boundsOfPolygons = (polygons: readonly Position[][][]): Bounds => {
	let bounds = EMPTY_BOUNDS;
	// Flattened twice, because a list of polygons nests as polygon, then ring, then position.
	for (const position of polygons.flat().flat()) {
		bounds = extend(bounds, position);
	}
	return bounds;
};

const areaOf = (bounds: Bounds): number => (bounds[2] - bounds[0]) * (bounds[3] - bounds[1]);

const areNeighbours = (one: Bounds, other: Bounds, gap: number): boolean =>
	!(
		one[2] + gap < other[0] ||
		other[2] + gap < one[0] ||
		one[3] + gap < other[1] ||
		other[3] + gap < one[1]
	);

const neighboursOf = (polygons: readonly Position[][][], bounds: Bounds): readonly Position[][][] =>
	polygons.filter((polygon) =>
		areNeighbours(bounds, boundsOfPolygons([polygon]), LANDMASS_GAP_DEGREES),
	);

/**
 * Grows outwards from the country's biggest polygon, taking in whatever sits alongside what it has
 * so far, so an archipelago stays whole while an island an ocean away is left behind.
 */
const homeLandmassOf = (polygons: readonly Position[][][]): Bounds => {
	const bySize = polygons.toSorted(
		(one, other) => areaOf(boundsOfPolygons([other])) - areaOf(boundsOfPolygons([one])),
	);
	let home: readonly Position[][][] = bySize.slice(0, 1);
	let bounds = boundsOfPolygons(home);
	let previous = 0;
	while (home.length !== previous) {
		previous = home.length;
		home = neighboursOf(bySize, bounds);
		bounds = boundsOfPolygons(home);
	}
	return bounds;
};

/** How far a polygon reaches in longitude, as its west and east edges. */
type Span = readonly [number, number];

/**
 * Where a continuous polygon reaches in longitude: one span, or for one carried on past 180 across
 * the antimeridian, the two halves either side of the line.
 */
const spansOf = (polygon: Position[][]): readonly Span[] => {
	const [west, , east] = boundsOfPolygons([polygon]);
	return east <= 180
		? [[west, east]]
		: [
				[west, 180],
				[-180, east - TURN_DEGREES],
			];
};

/**
 * The narrowest band of longitude covering every span, given sorted from west to east. It breaks
 * at the widest gap between them, starting from the one round the back of the globe, and when the
 * widest gap is anywhere else, its east edge runs on past 180.
 */
const longitudesOf = (first: Span, rest: readonly Span[]): Span => {
	let [west, reach] = first;
	let east = Math.max(reach, ...rest.map(([, spanEast]) => spanEast));
	let widestGap = west + 360 - east;
	for (const [spanWest, spanEast] of rest) {
		const gap = spanWest - reach;
		if (gap > widestGap) {
			widestGap = gap;
			[west, east] = [spanWest, reach + 360];
		}
		reach = Math.max(reach, spanEast);
	}
	return [west, east];
};

/**
 * A plain minimum and maximum would frame the whole world for a country with land either side of
 * the antimeridian, such as the United States with the Aleutians, where the band of longitude that
 * covers it instead runs from the Aleutians east across the line to Maine.
 */
const acrossAntimeridian = (polygons: readonly Position[][][]): Bounds => {
	const [first, ...rest] = polygons
		.flatMap((polygon) => spansOf(polygon))
		.toSorted(([oneWest], [otherWest]) => oneWest - otherWest);
	if (first === undefined) {
		return EMPTY_BOUNDS;
	}
	const [, south, , north] = boundsOfPolygons(polygons);
	const [west, east] = longitudesOf(first, rest);
	return [west, south, east, north];
};

/**
 * The box round a country's home landmass: its largest piece of land and whatever lies alongside
 * it, which is what reads as the country's shape, as on a passport stamp. It leaves out the
 * United States' Alaska and Hawaii, and New Zealand's outlying islands, where the box the camera
 * frames keeps them.
 */
export const landmassBoundsOf = (boundary: CountryBoundary): Bounds =>
	homeLandmassOf(polygonsOf(boundary));

/** The box the camera should frame when a country is selected. */
export const boundsOf = (boundary: CountryBoundary): Bounds => {
	const polygons = polygonsOf(boundary);
	return HOME_LANDMASS_ONLY.has(boundary.properties.iso_3166_1)
		? homeLandmassOf(polygons)
		: acrossAntimeridian(polygons);
};

/**
 * Turns the Natural Earth atlas into the boundaries the map fills in.
 *
 * Natural Earth keys its countries by alpha-3 and also ships territories with no ISO 3166-1 code
 * at all, such as Somaliland and the Siachen Glacier, so `codes` both translates the key and
 * filters out everything that is not a country the app tracks. The generation script passes the
 * codes it has just derived; everything else wants the generated ones.
 */
export const toBoundaries = (
	topology: Topology,
	codes: Readonly<Record<string, string>> = boundaryCodes,
): CountryBoundaries => {
	const object = topology.objects["countries"];
	if (object?.type !== "GeometryCollection") {
		throw new Error("The world atlas has no `countries` collection.");
	}

	return {
		features: feature(topology, object).features.flatMap((source) => {
			const { geometry, properties } = source;
			if (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon") {
				return [];
			}
			const alpha3: unknown = properties?.["a3"];
			const iso3166 = typeof alpha3 === "string" ? codes[alpha3] : undefined;
			if (iso3166 === undefined) {
				return [];
			}
			const continuous: Polygon | MultiPolygon =
				geometry.type === "Polygon"
					? { coordinates: continuousPolygon(geometry.coordinates), type: "Polygon" }
					: {
							coordinates: geometry.coordinates.map((polygon) => continuousPolygon(polygon)),
							type: "MultiPolygon",
						};
			return [
				{ geometry: continuous, properties: { iso_3166_1: iso3166 }, type: "Feature" as const },
			];
		}),
		type: "FeatureCollection",
	};
};
