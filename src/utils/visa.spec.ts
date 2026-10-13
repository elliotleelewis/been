import { describe, expect, it } from "vitest";

import type { Achievement } from "../models/achievement";
import { visaDesignOf, visaMrzOf } from "./visa";

const EUROPE: Achievement = {
	description: "Every country in Europe",
	id: "region:150",
	kind: "region",
	region: "150",
	requirements: [],
	title: "Europe",
};

describe("visa", () => {
	it("should design a visa the same way every time, in its region's ink", () => {
		expect.hasAssertions();

		const design = visaDesignOf(EUROPE);

		expect(visaDesignOf(EUROPE)).toStrictEqual(design);
		expect(design.ink).toBe("#4b3a8c");
		expect(design.type).toBe("CONTINENTAL");
		expect(Math.abs(design.rotation)).toBeLessThanOrEqual(1.5);
	}, 5000);

	it("should write the line along its foot as a machine-readable zone would", () => {
		expect.hasAssertions();

		const mrz = visaMrzOf({ ...EUROPE, title: "Côte d'Ivoire" }, visaDesignOf(EUROPE));

		expect(mrz).toMatch(/^V<<BEEN<<COTE<D<IVOIRE<<\d{7}<+$/u);
		expect(mrz).toHaveLength(36);
	}, 5000);
});
