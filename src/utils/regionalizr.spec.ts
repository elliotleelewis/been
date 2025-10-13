import { describe, expect, it } from "vitest";
import type { Country } from "../models/country";
import type { Region } from "../models/region";
import { regionalizer } from "./regionalizer";

describe("regionalizer", () => {
	it("should correctly group countries by region", () => {
		const countries: readonly Country[] = [
			{ iso3166: "A", name: "Country A", region: "Region 1" },
			{ iso3166: "B", name: "Country B", region: "Region 2" },
			{ iso3166: "C", name: "Country C", region: "Region 1" },
			{ iso3166: "D", name: "Country D", region: "Region 2" },
		];

		const expected: readonly Region[] = [
			{
				complete: 0,
				name: "Region 1",
				values: [
					{ iso3166: "A", name: "Country A", region: "Region 1" },
					{ iso3166: "C", name: "Country C", region: "Region 1" },
				],
			},
			{
				complete: 0,
				name: "Region 2",
				values: [
					{ iso3166: "B", name: "Country B", region: "Region 2" },
					{ iso3166: "D", name: "Country D", region: "Region 2" },
				],
			},
		];

		const result = regionalizer(countries);
		expect(result).toStrictEqual(expected);
	});

	it("should handle an empty array", () => {
		const countries: readonly Country[] = [];
		const result = regionalizer(countries);
		expect(result).toStrictEqual([]);
	});

	it("should correctly handle single country in each region", () => {
		const countries: readonly Country[] = [
			{ iso3166: "A", name: "Country A", region: "Region 1" },
			{ iso3166: "B", name: "Country B", region: "Region 2" },
			{ iso3166: "C", name: "Country C", region: "Region 3" },
		];

		const expected: readonly Region[] = [
			{
				complete: 0,
				name: "Region 1",
				values: [
					{ iso3166: "A", name: "Country A", region: "Region 1" },
				],
			},
			{
				complete: 0,
				name: "Region 2",
				values: [
					{ iso3166: "B", name: "Country B", region: "Region 2" },
				],
			},
			{
				complete: 0,
				name: "Region 3",
				values: [
					{ iso3166: "C", name: "Country C", region: "Region 3" },
				],
			},
		];

		const result = regionalizer(countries);
		expect(result).toStrictEqual(expected);
	});

	it("should sort the regions", () => {
		const countries: readonly Country[] = [
			{ iso3166: "A", name: "Country A", region: "Region 2" },
			{ iso3166: "B", name: "Country B", region: "Region 3" },
			{ iso3166: "C", name: "Country C", region: "Region 1" },
		];

		const result = regionalizer(countries);
		expect(result[0]?.name).toBe("Region 1");
		expect(result[1]?.name).toBe("Region 2");
		expect(result[2]?.name).toBe("Region 3");
	});

	it("should sort an empty region name", () => {
		const countriesA: readonly Country[] = [
			{ iso3166: "A", name: "Country A", region: "Region 2" },
			{ iso3166: "B", name: "Country B", region: "" },
			{ iso3166: "C", name: "Country C", region: "Region 1" },
		];

		const resultA = regionalizer(countriesA);
		expect(resultA[0]?.name).toBe("Region 1");
		expect(resultA[1]?.name).toBe("Region 2");
		expect(resultA[2]?.name).toBe("");

		const countriesB: readonly Country[] = [
			{ iso3166: "A", name: "Country A", region: "" },
			{ iso3166: "B", name: "Country B", region: "Region 1" },
			{ iso3166: "C", name: "Country C", region: "Region 2" },
		];

		const resultB = regionalizer(countriesB);
		expect(resultB[0]?.name).toBe("Region 1");
		expect(resultB[1]?.name).toBe("Region 2");
		expect(resultB[2]?.name).toBe("");
	});

	it("should not mutate the original array", () => {
		const countries: readonly Country[] = [
			{ iso3166: "A", name: "Country A", region: "Region 1" },
			{ iso3166: "B", name: "Country B", region: "Region 1" },
		];

		regionalizer(countries);
		expect(countries).toStrictEqual([
			{ iso3166: "A", name: "Country A", region: "Region 1" },
			{ iso3166: "B", name: "Country B", region: "Region 1" },
		]);
	});
});
