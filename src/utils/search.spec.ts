import { describe, expect, it } from "vitest";

import type { Country } from "../models/country";
import {
	bestMatchesOf,
	editDistance,
	foldText,
	matchTierOf,
	suggestionsFor,
	typoAllowanceOf,
} from "./search";

const EN = ["en"];

const country = (iso3166: string, name: string): Country => ({
	iso3166,
	name,
	region: "150",
	subregion: "155",
});

const COUNTRIES: readonly Country[] = [
	country("FR", "France"),
	country("ZA", "South Africa"),
	country("CI", "Côte d’Ivoire"),
	country("DE", "Germany"),
	country("GB", "United Kingdom"),
	country("FI", "Finland"),
	country("PL", "Poland"),
];

const namesOf = (countries: readonly Country[]): readonly string[] =>
	countries.map(({ name }) => name);

describe("search", () => {
	it("should fold away case, accents and punctuation", () => {
		expect.hasAssertions();

		expect(foldText("  Côte d’Ivoire ", EN)).toBe("cote d ivoire");
		expect(foldText("São Tomé & Príncipe", EN)).toBe("sao tome principe");
		expect(foldText("Guinea-Bissau", EN)).toBe("guinea bissau");
	}, 5000);

	it("should rank a code or the start of a word above the inside of a name", () => {
		expect.hasAssertions();

		expect(matchTierOf(country("GB", "United Kingdom"), "gb", EN)).toBe(1);
		expect(matchTierOf(country("GB", "United Kingdom"), "king", EN)).toBe(1);
		expect(matchTierOf(country("ZA", "South Africa"), "fr", EN)).toBe(2);
		expect(matchTierOf(country("FR", "France"), "xyz", EN)).toBeUndefined();
	}, 5000);

	it("should only show the best tier of matches", () => {
		expect.hasAssertions();

		expect(namesOf(bestMatchesOf(COUNTRIES, "fr", EN))).toStrictEqual(["France"]);
		expect(namesOf(bestMatchesOf(COUNTRIES, "land", EN))).toStrictEqual(["Finland", "Poland"]);
		expect(namesOf(bestMatchesOf(COUNTRIES, "cote d ivoire", EN))).toStrictEqual(["Côte d’Ivoire"]);
	}, 5000);

	it("should count a swap of two neighbouring letters as one edit", () => {
		expect.hasAssertions();

		expect(editDistance("germany", "germany")).toBe(0);
		expect(editDistance("gemrany", "germany")).toBe(1);
		expect(editDistance("germny", "germany")).toBe(1);
		expect(editDistance("", "abc")).toBe(3);
	}, 5000);

	it("should allow more typos in a longer search", () => {
		expect.hasAssertions();

		expect(typoAllowanceOf("de")).toBe(0);
		expect(typoAllowanceOf("germ")).toBe(1);
		expect(typoAllowanceOf("germny")).toBe(2);
	}, 5000);

	it("should suggest the countries a search is a typo or two away from", () => {
		expect.hasAssertions();

		expect(namesOf(suggestionsFor(COUNTRIES, "gemrany", EN))).toStrictEqual(["Germany"]);
		expect(namesOf(suggestionsFor(COUNTRIES, "kingdon", EN))).toStrictEqual(["United Kingdom"]);
		expect(namesOf(suggestionsFor(COUNTRIES, "xyz", EN))).toStrictEqual([]);
	}, 5000);
});
