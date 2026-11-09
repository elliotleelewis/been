import { describe, expect, it } from "vitest";

import {
	RESTING_FOIL,
	driftingFoilAt,
	foilOfDevice,
	foilOfPointer,
	foilPropertiesOf,
	foilTowards,
} from "./foil.ts";

describe("foil", () => {
	it("should catch the light under the pointer, at its brightest, never off the visa", () => {
		expect.hasAssertions();

		expect(foilOfPointer([100, 50, 300, 190], [175, 145])).toStrictEqual({
			across: 0.25,
			down: 0.5,
			shine: 1,
		});
		expect(foilOfPointer([100, 50, 300, 190], [0, 999])).toMatchObject({ across: 0, down: 1 });
	}, 5000);

	it("should follow the device's tilt from how it was first held", () => {
		expect.hasAssertions();

		expect(foilOfDevice(0, 40, 40)).toMatchObject({ across: 0.5, down: 0.5 });
		expect(foilOfDevice(15, 25, 40)).toMatchObject({ across: 0.75, down: 0.25 });
		expect(foilOfDevice(-90, 40, 40)).toMatchObject({ across: 0 });
	}, 5000);

	it("should ease towards where the light is headed, by the same share however often", () => {
		expect.hasAssertions();

		const target = { across: 1, down: 1, shine: 1 };
		const once = foilTowards(RESTING_FOIL, target, 100);
		const twice = foilTowards(foilTowards(RESTING_FOIL, target, 50), target, 50);

		expect(foilTowards(RESTING_FOIL, target, 0)).toStrictEqual(RESTING_FOIL);
		expect(once.across).toBeGreaterThan(RESTING_FOIL.across);
		expect(once.across).toBeLessThan(1);
		expect(twice.across).toBeCloseTo(once.across, 10);
	}, 5000);

	it("should drift over the visa without leaving it, and tilt the visa towards the light", () => {
		expect.hasAssertions();

		const drifts = Array.from({ length: 100 }, (_drift, index) => driftingFoilAt(index * 397));
		const places = drifts.flatMap(({ across, down }) => [across, down]);

		expect(Math.min(...places)).toBeGreaterThan(0);
		expect(Math.max(...places)).toBeLessThan(1);
		expect(foilPropertiesOf({ across: 1, down: 0.5, shine: 0.5 })).toStrictEqual({
			"--foil-shine": "0.500",
			"--foil-tilt-x": "0.00deg",
			"--foil-tilt-y": "7.00deg",
			"--foil-x": "100.00%",
			"--foil-y": "50.00%",
		});
	}, 5000);
});
