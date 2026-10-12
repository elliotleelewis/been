import type { Position } from "geojson";
import { describe, expect, it } from "vitest";

import { boundsOf } from "./boundaries";
import type { Bounds, CountryBoundary } from "./boundaries";

// A closed ring around a box, given as west, south, east, north.
const box = ([west, south, east, north]: Bounds): Position[][] => [
	[
		[west, south],
		[east, south],
		[east, north],
		[west, north],
		[west, south],
	],
];

const boundaryOf = (polygons: Position[][][]): CountryBoundary => ({
	geometry: { coordinates: polygons, type: "MultiPolygon" },
	properties: { iso_3166_1: "XX" },
	type: "Feature",
});

describe("boundsOf", () => {
	it("should frame a country that keeps to one side of the antimeridian", () => {
		expect.hasAssertions();

		const polygons = [box([-10, 40, 0, 50]), box([5, 45, 10, 55])];

		expect(boundsOf(boundaryOf(polygons))).toStrictEqual([-10, 40, 10, 55]);
	}, 5000);

	it("should frame a country with land either side of the antimeridian across it", () => {
		expect.hasAssertions();

		// Like the United States: the mainland, and islands at both ends of the globe.
		const polygons = [box([-125, 25, -67, 49]), box([172, 51, 180, 53]), box([-180, 51, -170, 53])];

		expect(boundsOf(boundaryOf(polygons))).toStrictEqual([172, 25, 293, 53]);
	}, 5000);

	it("should frame an island drawn across the antimeridian as one piece", () => {
		expect.hasAssertions();

		const island: Position[][] = [
			[
				[178, -17],
				[-179, -17],
				[-179, -16],
				[178, -16],
				[178, -17],
			],
		];

		expect(boundsOf(boundaryOf([island]))).toStrictEqual([178, -17, 181, -16]);
	}, 5000);
});
