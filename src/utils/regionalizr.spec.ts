import { describe, expect, it } from "vitest";

import type { Country } from "../models/country";
import type { M49Region, M49Subregion } from "../models/m49";
import type { Region } from "../models/region";
import { regionalizer } from "./regionalizer";

const collator = new Intl.Collator(["en"]);

const country = (name: string, region: M49Region, subregion: M49Subregion): Country => ({
	iso3166: name.slice(0, 2).toUpperCase(),
	name,
	region,
	subregion,
});

describe("regionalizer", () => {
	it("should correctly group countries by sub-region", () => {
		expect.hasAssertions();

		const countries: readonly Country[] = [
			country("France", "150", "155"),
			country("Sweden", "150", "154"),
			country("Germany", "150", "155"),
			country("Norway", "150", "154"),
		];

		const expected: readonly Region[] = [
			{
				complete: 0,
				name: "Northern Europe",
				values: [country("Norway", "150", "154"), country("Sweden", "150", "154")],
			},
			{
				complete: 0,
				name: "Western Europe",
				values: [country("France", "150", "155"), country("Germany", "150", "155")],
			},
		];

		const result = regionalizer(countries, collator);
		expect(result).toStrictEqual(expected);
	}, 5000);

	it("should handle an empty array", () => {
		expect.hasAssertions();

		const result = regionalizer([], collator);
		expect(result).toStrictEqual([]);
	}, 5000);

	it("should report how much of each sub-region is selected", () => {
		expect.hasAssertions();

		const countries: readonly Country[] = [
			{ ...country("France", "150", "155"), selected: true },
			country("Germany", "150", "155"),
		];

		const result = regionalizer(countries, collator);
		expect(result[0]?.complete).toBe(0.5);
	}, 5000);

	it("should sort sub-regions by their region first, then by name", () => {
		expect.hasAssertions();

		const countries: readonly Country[] = [
			country("France", "150", "155"),
			country("Brazil", "019", "005"),
			country("Poland", "150", "151"),
			country("Jamaica", "019", "029"),
		];

		const result = regionalizer(countries, collator);
		expect(result.map(({ name }) => name)).toStrictEqual([
			"Caribbean",
			"South America",
			"Eastern Europe",
			"Western Europe",
		]);
	}, 5000);

	it("should sort countries as the language it is given would", () => {
		expect.hasAssertions();

		const countries: readonly Country[] = [country("Ö", "150", "154"), country("Z", "150", "154")];

		// Swedish sorts Ö after Z, where English sorts it alongside O.
		const result = regionalizer(countries, new Intl.Collator(["sv"]));
		expect(result[0]?.values.map(({ name }) => name)).toStrictEqual(["Z", "Ö"]);
	}, 5000);

	it("should sort the countries within a sub-region", () => {
		expect.hasAssertions();

		const countries: readonly Country[] = [
			country("Germany", "150", "155"),
			country("France", "150", "155"),
		];

		const result = regionalizer(countries, collator);
		expect(result[0]?.values.map(({ name }) => name)).toStrictEqual(["France", "Germany"]);
	}, 5000);

	it("should not mutate the original array", () => {
		expect.hasAssertions();

		const countries: readonly Country[] = [
			country("Germany", "150", "155"),
			country("France", "150", "155"),
		];

		regionalizer(countries, collator);
		expect(countries).toStrictEqual([
			country("Germany", "150", "155"),
			country("France", "150", "155"),
		]);
	}, 5000);
});
