import { describe, expect, it } from "vitest";

import { countries } from "../data/countries";
import { decodeShare, encodeShare, fingerprintOf, shareUrlOf, shareValueOf } from "./share";

/** The order share links mark countries in, as the app derives it. */
const CODES = countries.map(({ iso3166 }) => iso3166).toSorted();

describe("share", () => {
	it("should read back the map it wrote", () => {
		expect.hasAssertions();

		const visits = { FR: {}, IE: {}, IT: {}, ZW: {} };

		expect(decodeShare(encodeShare(visits, CODES), CODES)).toStrictEqual(visits);
	}, 5000);

	it("should write any map at the same length", () => {
		expect.hasAssertions();

		const everything = Object.fromEntries(CODES.map((code) => [code, {}]));
		const { length } = encodeShare({}, CODES);

		expect(encodeShare(everything, CODES)).toHaveLength(length);
		expect(decodeShare(encodeShare(everything, CODES), CODES)).toStrictEqual(everything);
	}, 5000);

	it("should fingerprint each list of codes differently", () => {
		expect.hasAssertions();

		expect(fingerprintOf(CODES)).toBe(fingerprintOf([...CODES]));
		expect(fingerprintOf(CODES)).not.toBe(fingerprintOf(CODES.filter((code) => code !== "FR")));
		expect(fingerprintOf(CODES)).not.toBe(fingerprintOf([...CODES, "XK"].toSorted()));
	}, 5000);

	it("should leave out a code it has no place for", () => {
		expect.hasAssertions();

		expect(decodeShare(encodeShare({ FR: {}, XX: {} }, CODES), CODES)).toStrictEqual({ FR: {} });
	}, 5000);

	it("should not read a value in any other format, or written against another list", () => {
		expect.hasAssertions();

		const rest = encodeShare({ FR: {} }, CODES).slice("1.".length);
		const longerList = [...CODES, "TW", "XK"].toSorted();
		const againstLongerList = encodeShare({ FR: {} }, longerList);

		expect(decodeShare(`2.${rest}`, CODES)).toBeUndefined();
		expect(decodeShare(againstLongerList, CODES)).toBeUndefined();
		expect(decodeShare("1.!!not base64!!", CODES)).toBeUndefined();
		expect(decodeShare("nonsense", CODES)).toBeUndefined();
	}, 5000);

	it("should find the value in a hash, and build a link around it", () => {
		expect.hasAssertions();

		const url = shareUrlOf("1.AAAA", { href: "https://been.example/path?debug=1#old" });

		expect(url).toBe("https://been.example/path#share=1.AAAA");
		expect(shareValueOf(new globalThis.URL(url).hash)).toBe("1.AAAA");
		expect(shareValueOf("#something-else")).toBeUndefined();
	}, 5000);
});
