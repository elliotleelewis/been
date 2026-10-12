import { describe, expect, it } from "vitest";

import { isVisits } from "./visits";

describe("isVisits", () => {
	it("should accept visits keyed by country code", () => {
		expect.hasAssertions();

		expect(isVisits({})).toBeTruthy();
		expect(isVisits({ FR: {}, GB: {} })).toBeTruthy();
	}, 5000);

	it("should reject the list of codes older versions stored", () => {
		expect.hasAssertions();

		expect(isVisits(["FR", "GB"])).toBeFalsy();
	}, 5000);

	it("should reject anything else", () => {
		expect.hasAssertions();

		expect(isVisits(null)).toBeFalsy();
		expect(isVisits("FR")).toBeFalsy();
		expect(isVisits({ FR: true })).toBeFalsy();
		expect(isVisits({ FR: [] })).toBeFalsy();
		expect(isVisits({ FR: { unknown: 1 } })).toBeFalsy();
	}, 5000);
});
