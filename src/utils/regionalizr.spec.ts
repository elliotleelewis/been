import { describe, expect, it } from "vitest";

import type { Country } from "../models/country";
import type { M49Region, M49Subregion } from "../models/m49";
import { regionalizer } from "./regionalizer";

const collator = new Intl.Collator(["en"]);

const country = (name: string, region: M49Region, subregion: M49Subregion): Country => ({
	iso3166: name.slice(0, 2).toUpperCase(),
	name,
	region,
	subregion,
});

const france = country("France", "150", "155");
const germany = country("Germany", "150", "155");
const norway = country("Norway", "150", "154");
const brazil = country("Brazil", "019", "005");
const jamaica = country("Jamaica", "019", "029");

describe("regionalizer", () => {
	it("should group countries by region, then by sub-region", () => {
		expect.hasAssertions();

		const result = regionalizer([france, brazil, norway, germany], collator);

		expect(result).toStrictEqual([
			{
				code: "019",
				name: "Americas",
				total: 1,
				values: [{ complete: 0, name: "South America", values: [brazil] }],
				visited: 0,
			},
			{
				code: "150",
				name: "Europe",
				total: 3,
				values: [
					{ complete: 0, name: "Northern Europe", values: [norway] },
					{ complete: 0, name: "Western Europe", values: [france, germany] },
				],
				visited: 0,
			},
		]);
	}, 5000);

	it("should handle an empty array", () => {
		expect.hasAssertions();

		expect(regionalizer([], collator)).toStrictEqual([]);
	}, 5000);

	it("should count what is visited in each region and sub-region", () => {
		expect.hasAssertions();

		const result = regionalizer([{ ...france, selected: true }, germany, norway], collator);

		expect(result[0]?.visited).toBe(1);
		expect(result[0]?.total).toBe(3);
		expect(result[0]?.values.map(({ complete }) => complete)).toStrictEqual([0, 0.5]);
	}, 5000);

	it("should put the home region first", () => {
		expect.hasAssertions();

		const result = regionalizer([brazil, france], collator, "150");

		expect(result.map(({ name }) => name)).toStrictEqual(["Europe", "Americas"]);
	}, 5000);

	it("should sort sub-regions within a region by name", () => {
		expect.hasAssertions();

		const result = regionalizer([brazil, jamaica], collator);

		expect(result[0]?.values.map(({ name }) => name)).toStrictEqual(["Caribbean", "South America"]);
	}, 5000);

	it("should sort countries as the language it is given would", () => {
		expect.hasAssertions();

		const countries: readonly Country[] = [country("Ö", "150", "154"), country("Z", "150", "154")];

		// Swedish sorts Ö after Z, where English sorts it alongside O.
		const result = regionalizer(countries, new Intl.Collator(["sv"]));
		expect(result[0]?.values[0]?.values.map(({ name }) => name)).toStrictEqual(["Z", "Ö"]);
	}, 5000);

	it("should not mutate the original array", () => {
		expect.hasAssertions();

		const countries: readonly Country[] = [germany, france];

		regionalizer(countries, collator);
		expect(countries).toStrictEqual([germany, france]);
	}, 5000);
});
