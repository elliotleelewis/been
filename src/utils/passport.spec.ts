import { describe, expect, it } from "vitest";

import type { PassportStats } from "../models/passport";
import { fontSizeFor, mrzOf } from "./passport";

const STATS: PassportStats = {
	count: 23,
	first: "13 OCT 2026",
	home: "Europe",
	latest: "13 OCT 2026",
	regions: 4,
	total: 195,
};

describe("passport", () => {
	it("should write the machine-readable zone as two full lines of capitals", () => {
		expect.hasAssertions();

		const [first, second] = mrzOf(STATS);

		expect(first).toBe("P<<BEEN<<023<COUNTRIES<<<<<<<<<<<<<<<<<<<<<<");
		expect(second).toBe("4<REGIONS<<EUROPE<<OF<195<<<<<<<<<<<<<<<<<<<");
	}, 5000);

	it("should shrink lettering to fit, but never grow it", () => {
		expect.hasAssertions();

		expect(fontSizeFor("CUBA", 140, 10)).toBe(10);
		expect(fontSizeFor("SAINT VINCENT & GRENADINES", 140, 10)).toBeLessThan(10);
	}, 5000);
});
