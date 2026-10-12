import { describe, expect, it } from "vitest";

import { SHARE_CODES } from "../models/share";
import { decodeShare, encodeShare, shareUrlOf, shareValueOf } from "./share";

describe("share", () => {
	it("should read back the map it wrote", () => {
		expect.hasAssertions();

		const visits = { FR: {}, IE: {}, IT: {}, ZW: {} };

		expect(decodeShare(encodeShare(visits))).toStrictEqual(visits);
	}, 5000);

	it("should write any map in the same 36 characters", () => {
		expect.hasAssertions();

		const everything = Object.fromEntries(SHARE_CODES.map((code) => [code, {}]));

		expect(encodeShare({})).toHaveLength(36);
		expect(encodeShare(everything)).toHaveLength(36);
		expect(decodeShare(encodeShare(everything))).toStrictEqual(everything);
	}, 5000);

	it("should leave out a code it has no place for", () => {
		expect.hasAssertions();

		expect(decodeShare(encodeShare({ FR: {}, XX: {} }))).toStrictEqual({ FR: {} });
	}, 5000);

	it("should not read a value in any other format", () => {
		expect.hasAssertions();

		const payload = encodeShare({ FR: {} }).slice("1.".length);

		expect(decodeShare(`2.${payload}`)).toBeUndefined();
		expect(decodeShare("1.AAAA")).toBeUndefined();
		expect(decodeShare("1.!!not base64!!")).toBeUndefined();
		expect(decodeShare("nonsense")).toBeUndefined();
	}, 5000);

	it("should find the value in a hash, and build a link around it", () => {
		expect.hasAssertions();

		const url = shareUrlOf({ FR: {} }, { href: "https://been.example/path?debug=1#old" });

		expect(url).toBe(`https://been.example/path#share=${encodeShare({ FR: {} })}`);
		expect(shareValueOf(new globalThis.URL(url).hash)).toBe(encodeShare({ FR: {} }));
		expect(shareValueOf("#something-else")).toBeUndefined();
	}, 5000);
});
