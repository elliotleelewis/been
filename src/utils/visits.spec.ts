import { describe, expect, it } from "vitest";

import { isVisits, visitOn } from "./visits";

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

	it("should accept visits with the day they were ticked", () => {
		expect.hasAssertions();

		expect(isVisits({ FR: { at: "2026-10-13" }, GB: {} })).toBeTruthy();
	}, 5000);

	it("should reject a day that is not an ISO 8601 date", () => {
		expect.hasAssertions();

		expect(isVisits({ FR: { at: "13/10/2026" } })).toBeFalsy();
		expect(isVisits({ FR: { at: 20_261_013 } })).toBeFalsy();
	}, 5000);

	it("should date a visit by the reader's own calendar", () => {
		expect.hasAssertions();

		expect(visitOn(new Date(2026, 0, 5, 23, 30))).toStrictEqual({ at: "2026-01-05" });
	}, 5000);
});
