import { describe, expect, it } from "vitest";

import type { Country } from "../models/country";
import type { Region } from "../models/region";
import { regionalizer } from "./regionalizer";

const country = (iso3166: string, region: string, subregion: string): Country => ({
	iso3166,
	name: `Country ${iso3166}`,
	region,
	subregion,
});

describe("regionalizer", () => {
	it("should correctly group countries by sub-region", () => {
		expect.hasAssertions();

		const countries: readonly Country[] = [
			country("A", "Region", "Sub-region 1"),
			country("B", "Region", "Sub-region 2"),
			country("C", "Region", "Sub-region 1"),
			country("D", "Region", "Sub-region 2"),
		];

		const expected: readonly Region[] = [
			{
				complete: 0,
				name: "Sub-region 1",
				values: [country("A", "Region", "Sub-region 1"), country("C", "Region", "Sub-region 1")],
			},
			{
				complete: 0,
				name: "Sub-region 2",
				values: [country("B", "Region", "Sub-region 2"), country("D", "Region", "Sub-region 2")],
			},
		];

		const result = regionalizer(countries);
		expect(result).toStrictEqual(expected);
	}, 5000);

	it("should handle an empty array", () => {
		expect.hasAssertions();

		const countries: readonly Country[] = [];
		const result = regionalizer(countries);
		expect(result).toStrictEqual([]);
	}, 5000);

	it("should report how much of each sub-region is selected", () => {
		expect.hasAssertions();

		const countries: readonly Country[] = [
			{ ...country("A", "Region", "Sub-region"), selected: true },
			country("B", "Region", "Sub-region"),
		];

		const result = regionalizer(countries);
		expect(result[0]?.complete).toBe(0.5);
	}, 5000);

	it("should sort sub-regions by their region first, then by name", () => {
		expect.hasAssertions();

		const countries: readonly Country[] = [
			country("A", "Europe", "Western Europe"),
			country("B", "Americas", "South America"),
			country("C", "Europe", "Eastern Europe"),
			country("D", "Americas", "Caribbean"),
		];

		const result = regionalizer(countries);
		expect(result.map(({ name }) => name)).toStrictEqual([
			"Caribbean",
			"South America",
			"Eastern Europe",
			"Western Europe",
		]);
	}, 5000);

	it("should sort the countries within a sub-region", () => {
		expect.hasAssertions();

		const countries: readonly Country[] = [
			country("B", "Region", "Sub-region"),
			country("A", "Region", "Sub-region"),
		];

		const result = regionalizer(countries);
		expect(result[0]?.values.map(({ iso3166 }) => iso3166)).toStrictEqual(["A", "B"]);
	}, 5000);

	it("should not mutate the original array", () => {
		expect.hasAssertions();

		const countries: readonly Country[] = [
			country("B", "Region", "Sub-region"),
			country("A", "Region", "Sub-region"),
		];

		regionalizer(countries);
		expect(countries).toStrictEqual([
			country("B", "Region", "Sub-region"),
			country("A", "Region", "Sub-region"),
		]);
	}, 5000);
});
