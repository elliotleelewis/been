import { describe, expect, it } from "vitest";

import { qrPathOf, qrSvgOf } from "./qr";

const MODULES = [
	[true, false],
	[false, true],
];

describe("qr", () => {
	it("should draw each dark module as a unit square", () => {
		expect.hasAssertions();

		expect(qrPathOf(MODULES)).toBe("M0 0h1v1h-1zM1 1h1v1h-1z");
	}, 5000);

	it("should draw the code black on white, one unit to a module", () => {
		expect.hasAssertions();

		const svg = qrSvgOf(MODULES);

		expect(svg).toContain('viewBox="0 0 2 2"');
		expect(svg).toContain('fill="#fff"');
		expect(svg).toContain('fill="#000"');
	}, 5000);
});
