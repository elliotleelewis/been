import { describe, expect, it } from "vitest";

import { countries } from "../data/countries";
import { STAMP_INKS, STAMP_SHAPES } from "../models/stamp";
import { hashOf } from "./hash";
import { stampDesignOf } from "./stamp";

const DESIGNS = countries.map(({ iso3166, region }) => stampDesignOf(iso3166, region));

describe("stamp", () => {
	it("should hash the same text the same way, and different text differently", () => {
		expect.hasAssertions();

		expect(hashOf("FR")).toBe(hashOf("FR"));
		expect(hashOf("FR")).not.toBe(hashOf("RF"));
	}, 5000);

	it("should design a country's stamp the same way every time", () => {
		expect.hasAssertions();

		expect(stampDesignOf("FR", "150")).toStrictEqual(stampDesignOf("FR", "150"));
	}, 5000);

	it("should ink a stamp in its region's colour", () => {
		expect.hasAssertions();

		expect(stampDesignOf("FR", "150").ink).toBe(STAMP_INKS["150"]);
		expect(stampDesignOf("JP", "142").ink).toBe(STAMP_INKS["142"]);
	}, 5000);

	it("should use every shape across the countries", () => {
		expect.hasAssertions();

		expect(new Set(DESIGNS.map(({ shape }) => shape))).toStrictEqual(new Set(STAMP_SHAPES));
	}, 5000);

	it("should keep every stamp's slant and nudge within bounds", () => {
		expect.hasAssertions();

		expect(DESIGNS.every(({ rotation }) => Math.abs(rotation) <= 14)).toBeTruthy();
		expect(
			DESIGNS.every(({ offset }) => offset.every((nudge) => Math.abs(nudge) <= 10)),
		).toBeTruthy();
	}, 5000);
});
