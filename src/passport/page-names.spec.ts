import { describe, expect, it } from "vitest";

import { openingNameOf } from "./page-names.ts";

describe("page names", () => {
	it("should name two facing pages of one part as a run of it", () => {
		expect.hasAssertions();

		expect(
			openingNameOf([
				{ index: 0, kind: "locked", of: 2 },
				{ index: 1, kind: "locked", of: 2 },
			]),
		).toBe("Within reach 1–2 of 2");
		expect(
			openingNameOf([
				{ index: 2, kind: "stamps", of: 5 },
				{ index: 3, kind: "stamps", of: 5 },
			]),
		).toBe("Stamps 3–4 of 5");
	}, 5000);

	it("should name facing pages of different parts each in turn", () => {
		expect.hasAssertions();

		expect(
			openingNameOf([
				{ index: 1, kind: "visas", of: 2 },
				{ index: 0, kind: "locked", of: 1 },
			]),
		).toBe("Visas 2 of 2 · Within reach 1 of 1");
		expect(openingNameOf([{ kind: "identity" }, { index: 0, kind: "visas", of: 1 }])).toBe(
			"Identity · Visas 1 of 1",
		);
	}, 5000);

	it("should name a page on its own, or facing a blank one, by itself", () => {
		expect.hasAssertions();

		expect(openingNameOf([{ kind: "cover" }])).toBe("Cover");
		expect(openingNameOf([{ index: 2, kind: "stamps", of: 3 }, null])).toBe("Stamps 3 of 3");
	}, 5000);
});
