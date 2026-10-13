import { describe, expect, it } from "vitest";

import { assertDefined } from "../core/test.ts";
import type { CountryData } from "../core/types.ts";
import { achievementsOf, earnedOn, isEarned, newlyEarned } from "./achievements.ts";

const COUNTRIES: readonly CountryData[] = [
	{ bounds: [-5, 42, 8, 51], iso3166: "FR", region: "150", subregion: "155" },
	{ bounds: [6, 36, 18, 47], iso3166: "IT", region: "150", subregion: "039" },
	{ bounds: [12, 41.9, 12.5, 42], iso3166: "VA", region: "150", subregion: "039" },
	{ bounds: [-74, -34, -34, 5], iso3166: "BR", region: "019", subregion: "005" },
	{ bounds: [177, -21, 182, -12], iso3166: "FJ", region: "009", subregion: "054" },
];

const achievementOf = (id: string): ReturnType<typeof achievementsOf>[number] =>
	assertDefined(
		achievementsOf(COUNTRIES).find((achievement) => achievement.id === id),
		`There is no achievement ${id}.`,
	);

describe("achievements", () => {
	it("should offer only the achievements a list of countries can earn", () => {
		expect.hasAssertions();

		expect(achievementsOf(COUNTRIES).map(({ id }) => id)).toStrictEqual([
			"milestone:1",
			"milestone:all",
			"region:009",
			"region:019",
			"region:150",
			"subregion:005",
			"subregion:039",
			"subregion:054",
			"subregion:155",
			"geography:equator-sides",
			"geography:meridian-sides",
			"geography:hemispheres",
			"geography:equator",
			"geography:date-line",
		]);
		expect(achievementsOf([])).toStrictEqual([]);
	}, 5000);

	it("should take two countries to cross the equator, but one that the equator runs through", () => {
		expect.hasAssertions();

		const sides = achievementOf("geography:equator-sides");
		const equator = achievementOf("geography:equator");

		expect(isEarned(sides, { BR: {} })).toBeFalsy();
		expect(isEarned(equator, { BR: {} })).toBeTruthy();
		expect(isEarned(sides, { BR: {}, FR: {} })).toBeTruthy();
		expect(isEarned(achievementOf("geography:date-line"), { FJ: {} })).toBeTruthy();
	}, 5000);

	it("should date an achievement by the tick that met the last of its requirements", () => {
		expect.hasAssertions();

		const europe = achievementOf("region:150");
		const visits = { FR: { at: "2025-01-02" }, IT: {}, VA: { at: "2024-06-30" } };

		expect(earnedOn(europe, visits)).toBe("2025-01-02");
		expect(earnedOn(achievementOf("milestone:1"), visits)).toBeUndefined();
	}, 5000);

	it("should name only what a tick has just earned", () => {
		expect.hasAssertions();

		const achievements = achievementsOf(COUNTRIES);
		const earned = newlyEarned(achievements, { FR: {}, IT: {}, VA: {} }, "VA");

		expect(earned.map(({ id }) => id)).toStrictEqual(["region:150", "subregion:039"]);
	}, 5000);
});
