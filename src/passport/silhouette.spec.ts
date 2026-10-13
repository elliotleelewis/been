import type { Position } from "geojson";
import { describe, expect, it } from "vitest";

import type { Bounds, CountryBoundary } from "../data/boundaries.ts";
import { silhouetteOf } from "./silhouette.ts";

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

/** Every point a path visits, as numbers. */
const pointsOf = (path: string): readonly number[] =>
	path
		.split(/[MLZ ]/u)
		.filter((part) => part !== "")
		.map(Number);

/** Whether every point of a path lands inside the 100-unit square it is drawn in. */
const withinSquare = (path: string): boolean =>
	pointsOf(path).every((value) => value >= 0 && value <= 100);

describe("silhouette", () => {
	it("should fit a country into the square, keeping its shape", () => {
		expect.hasAssertions();

		// Twice as wide as tall at the equator, so it fills the width and half the height.
		const path = silhouetteOf(boundaryOf([box([0, -5, 20, 5])]), [0, -5, 20, 5], 100);

		expect(path).toBe("M0 75L100 75L100 25L0 25Z");
	}, 5000);

	it("should leave out land an ocean away from the bounds", () => {
		expect.hasAssertions();

		const path = silhouetteOf(
			boundaryOf([box([0, 0, 10, 10]), box([100, 0, 110, 10])]),
			[0, 0, 10, 10],
			100,
		);

		expect(path.match(/M/gu)).toHaveLength(1);
	}, 5000);

	it("should draw land either side of the antimeridian together", () => {
		expect.hasAssertions();

		// Like the United States: bounds that run on past 180, and a mainland west of the line.
		const path = silhouetteOf(
			boundaryOf([box([172, 0, 180, 4]), box([-176, 0, -168, 4])]),
			[172, 0, 192, 4],
			100,
		);

		expect(withinSquare(path)).toBeTruthy();
		expect(path.match(/M/gu)).toHaveLength(2);
	}, 5000);
});
