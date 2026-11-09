import { describe, expect, it } from "vitest";

import { spunCameraOf } from "./spin.ts";
import { GLOBE_MIN_ZOOM } from "./types.ts";

describe("spin", () => {
	it("should turn the globe west to east, a whole turn every two minutes", () => {
		expect.hasAssertions();

		expect(spunCameraOf([10, 0], GLOBE_MIN_ZOOM, 1000)).toStrictEqual({
			center: [7, 0],
			zoom: GLOBE_MIN_ZOOM,
		});
	}, 5000);

	it("should bring the camera back over the equator at the pace it turns", () => {
		expect.hasAssertions();

		expect(spunCameraOf([0, 40], GLOBE_MIN_ZOOM, 1000).center[1]).toBeCloseTo(37, 10);
		expect(spunCameraOf([0, -2], GLOBE_MIN_ZOOM, 1000).center[1]).toBe(0);
	}, 5000);

	it("should pull the camera back out to the whole world as it turns, and no further", () => {
		expect.hasAssertions();

		const { zoom } = spunCameraOf([0, 0], 2.6, 1000);

		expect(zoom).toBeLessThan(2.6);
		expect(zoom).toBeGreaterThan(GLOBE_MIN_ZOOM);
		expect(spunCameraOf([0, 0], 2.6, 60_000).zoom).toBe(GLOBE_MIN_ZOOM);
	}, 5000);
});
