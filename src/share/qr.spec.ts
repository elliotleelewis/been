import { describe, expect, it } from "vitest";

import { QR_COLOURS, qrPathOf, qrSvgOf } from "./qr.ts";

const MODULES = [
	[true, false],
	[false, true],
];

/** A code 21 modules wide with a quiet zone of 1, all dark, as far as drawing it goes. */
const DARK = Array.from({ length: 21 }, () => Array.from({ length: 21 }, () => true));

describe("qr", () => {
	it("should draw each dark module as a unit square", () => {
		expect.hasAssertions();

		expect(qrPathOf(MODULES)).toBe("M0 0h1v1h-1zM1 1h1v1h-1z");
	}, 5000);

	it("should draw the code in the app's colours, one unit to a module", () => {
		expect.hasAssertions();

		const svg = qrSvgOf(MODULES, 0);

		expect(svg).toContain('viewBox="0 0 2 2"');
		expect(svg).toContain(`fill="${QR_COLOURS.paper}"`);
		expect(svg).toContain(`fill="${QR_COLOURS.ink}"`);
	}, 5000);

	it("should draw the finder patterns whole in the corners, not module by module", () => {
		expect.hasAssertions();

		const svg = qrSvgOf(DARK, 1);

		// The modules inside the three finder patterns are left to the rounded squares over them.
		expect(svg).not.toContain("M1 1h1v1h-1z");
		expect(svg).toContain("M8 1h1v1h-1z");
		expect(svg.match(new RegExp(`stroke="${QR_COLOURS.finder}"`, "gu"))).toHaveLength(3);
	}, 5000);
});
