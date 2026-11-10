import { describe, expect, it } from "vitest";

import { compareVisits, standingsOf } from "./compare.ts";

describe("compareVisits", () => {
	it("should sort countries into those on both maps, the shared one's and the reader's", () => {
		expect.hasAssertions();

		expect(
			compareVisits({ FR: {}, IT: {}, JP: {} }, { FR: { at: "2026-10-13" }, GB: {} }, [
				"FR",
				"GB",
				"IT",
				"JP",
				"US",
			]),
		).toStrictEqual({ both: ["FR"], mine: ["GB"], theirs: ["IT", "JP"] });
	}, 5000);

	it("should leave out countries not in the list", () => {
		expect.hasAssertions();

		expect(compareVisits({ XX: {} }, { YY: {} }, ["FR"])).toStrictEqual({
			both: [],
			mine: [],
			theirs: [],
		});
	}, 5000);
});

describe("standingsOf", () => {
	it("should give each country its standing", () => {
		expect.hasAssertions();

		expect(standingsOf({ both: ["FR"], mine: ["GB"], theirs: ["IT"] })).toStrictEqual(
			new Map([
				["FR", "both"],
				["IT", "theirs"],
				["GB", "mine"],
			]),
		);
	}, 5000);
});
