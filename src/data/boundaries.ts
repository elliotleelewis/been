import type { FeatureCollection, MultiPolygon, Polygon, Position } from "geojson";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";

import { boundaryCodes } from "./boundary-codes.ts";

export interface BoundaryProperties {
	readonly iso_3166_1: string;
}

export type CountryBoundaries = FeatureCollection<Polygon | MultiPolygon, BoundaryProperties>;
export type CountryBoundary = CountryBoundaries["features"][number];
export type Bounds = readonly [number, number, number, number];

export const EMPTY_BOUNDARIES: CountryBoundaries = { features: [], type: "FeatureCollection" };

// Natural Earth draws a country and its overseas territories as a single shape, so France reaches
// from Guadeloupe to Réunion and the Netherlands into the Caribbean. For the countries whose
// territories the app does not list separately, the camera should frame the home landmass, which
// is where it went when those territories were features of their own. Everywhere else the whole
// shape is the right frame: Spain's Canaries and Portugal's Azores have no ISO 3166-1 code of
// their own, so they belong inside their country's bounds.
const HOME_LANDMASS_ONLY: ReadonlySet<string> = new Set(["FR", "NL", "NO"]);

// How far apart two parts of a country may sit and still count as one landmass. Wide enough to
// hold Corsica onto France, narrow enough to leave Réunion off it.
const LANDMASS_GAP_DEGREES = 2;

const polygonsOf = (boundary: CountryBoundary): readonly Position[][][] =>
	boundary.geometry.type === "Polygon"
		? [boundary.geometry.coordinates]
		: boundary.geometry.coordinates;

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

// Grows outwards from the country's biggest polygon, taking in whatever sits alongside what it has
// so far, so an archipelago stays whole while an island an ocean away is left behind.
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

// The box the camera should frame when a country is selected.
export const boundsOf = (boundary: CountryBoundary): Bounds => {
	const polygons = polygonsOf(boundary);
	return HOME_LANDMASS_ONLY.has(boundary.properties.iso_3166_1)
		? homeLandmassOf(polygons)
		: boundsOfPolygons(polygons);
};

// Turns the Natural Earth atlas into the boundaries the map fills in.
//
// Natural Earth keys its countries by alpha-3 and also ships territories with no ISO 3166-1 code
// at all, such as Somaliland and the Siachen Glacier, so `codes` both translates the key and
// filters out everything that is not a country the app tracks. The generation script passes the
// codes it has just derived; everything else wants the generated ones.
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
			return iso3166 === undefined
				? []
				: [{ geometry, properties: { iso_3166_1: iso3166 }, type: "Feature" as const }];
		}),
		type: "FeatureCollection",
	};
};
