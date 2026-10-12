import { describe, expect, it } from "vitest";

import { M49_REGION_CODES, homeRegionOf, isExpandedRegions } from "./m49";

describe("m49", () => {
	it("should list every region", () => {
		expect.hasAssertions();

		expect(M49_REGION_CODES).toStrictEqual(["002", "009", "019", "142", "150"]);
	}, 5000);

	it("should guess a home region from a time zone", () => {
		expect.hasAssertions();

		expect(homeRegionOf("Europe/London")).toBe("150");
		expect(homeRegionOf("America/Sao_Paulo")).toBe("019");
		expect(homeRegionOf("Asia/Tokyo")).toBe("142");
		expect(homeRegionOf("Africa/Nairobi")).toBe("002");
	}, 5000);

	it("should guess Oceania from both of the areas its time zones are named after", () => {
		expect.hasAssertions();

		expect(homeRegionOf("Australia/Sydney")).toBe("009");
		expect(homeRegionOf("Pacific/Auckland")).toBe("009");
	}, 5000);

	it("should not guess from a time zone that spans regions", () => {
		expect.hasAssertions();

		expect(homeRegionOf("Atlantic/Reykjavik")).toBeUndefined();
		expect(homeRegionOf("Indian/Mauritius")).toBeUndefined();
		expect(homeRegionOf("UTC")).toBeUndefined();
		expect(homeRegionOf("Etc/GMT+5")).toBeUndefined();
	}, 5000);

	it("should accept the open continents as stored", () => {
		expect.hasAssertions();

		expect(isExpandedRegions(null)).toBeTruthy();
		expect(isExpandedRegions([])).toBeTruthy();
		expect(isExpandedRegions(["150", "019"])).toBeTruthy();
	}, 5000);

	it("should reject anything else", () => {
		expect.hasAssertions();

		expect(isExpandedRegions(["Europe"])).toBeFalsy();
		expect(isExpandedRegions("150")).toBeFalsy();
		expect(isExpandedRegions({ 150: true })).toBeFalsy();
	}, 5000);
});
