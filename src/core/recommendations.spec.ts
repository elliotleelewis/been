import { describe, expect, it } from "vitest";

import { achievementsOf } from "./achievements.ts";
import { recommendationsOf } from "./recommendations.ts";
import type { CountryData, Visits } from "./types.ts";

/**
 * A small world: France and its neighbours Belgium and Luxembourg, Western Europe all three, then
 * Italy beside France, and China and Japan a world away, all of a size.
 */
const COUNTRIES: readonly CountryData[] = [
	{
		area: 100_000,
		centre: [4.45, 50.5],
		iso3166: "BE",
		neighbours: ["FR", "LU"],
		region: "150",
		subregion: "155",
	},
	{ area: 100_000, centre: [104, 35.5], iso3166: "CN", region: "142", subregion: "030" },
	{
		area: 100_000,
		centre: [1.5, 46.5],
		iso3166: "FR",
		neighbours: ["BE", "IT", "LU"],
		region: "150",
		subregion: "155",
	},
	{
		area: 100_000,
		centre: [12.55, 41.5],
		iso3166: "IT",
		neighbours: ["FR"],
		region: "150",
		subregion: "039",
	},
	{ area: 100_000, centre: [137.5, 38], iso3166: "JP", region: "142", subregion: "030" },
	{
		area: 100_000,
		centre: [6.1, 49.8],
		iso3166: "LU",
		neighbours: ["BE", "FR"],
		region: "150",
		subregion: "155",
	},
];

const recommend = (visits: Visits): ReturnType<typeof recommendationsOf> =>
	recommendationsOf(COUNTRIES, visits, achievementsOf(COUNTRIES));

describe("recommendations", () => {
	it("should recommend nothing to a map with no visits yet", () => {
		expect.hasAssertions();

		expect(recommend({})).toStrictEqual([]);
	}, 5000);

	it("should put the country that completes an area first, for that and its border", () => {
		expect.hasAssertions();

		const [first] = recommend({ BE: { at: "2026-01-01" }, FR: { at: "2026-02-01" } });

		expect(first?.code).toBe("LU");
		expect(first?.reasons.slice(0, 2)).toMatchObject([
			{ achievement: { id: "region:150" }, kind: "achievement", remaining: 2 },
			{ achievement: { id: "subregion:155" }, kind: "achievement", remaining: 1 },
		]);
		expect(first?.reasons).toContainEqual({ kind: "neighbour", neighbour: "FR" });
	}, 5000);

	it("should name the latest-visited neighbour, and never a country already visited", () => {
		expect.hasAssertions();

		const recommended = recommend({ BE: { at: "2026-03-01" }, FR: { at: "2026-01-01" } });
		const luxembourg = recommended.find(({ code }) => code === "LU");

		expect(luxembourg?.reasons).toContainEqual({ kind: "neighbour", neighbour: "BE" });
		expect(recommended.map(({ code }) => code)).not.toContain("FR");
		expect(recommended.map(({ code }) => code)).not.toContain("BE");
	}, 5000);

	it("should favour somewhere near over somewhere as new but a world away", () => {
		expect.hasAssertions();

		const codes = recommend({ FR: {} }).map(({ code }) => code);

		// Western Europe is under way, so Belgium and Luxembourg lead. China and Japan would each be
		// Asia's first, and China is the nearer of the two; Italy, next door, comes before Japan.
		expect(codes).toStrictEqual(["BE", "LU", "CN", "IT", "JP"]);
	}, 5000);

	it("should count only the achievements the map has started on", () => {
		expect.hasAssertions();

		const japan = recommend({ FR: {} }).find(({ code }) => code === "JP");

		// Asia is untouched, so Japan is only ever its first, not a step towards finishing it.
		expect(japan?.reasons).toStrictEqual([{ kind: "region", region: "142" }]);
	}, 5000);

	it("should make a continent's first a country to see it by, not an atoll nearer to hand", () => {
		expect.hasAssertions();

		// Oceania, with Australia and Kiribati, an atoll a good deal nearer Japan.
		const oceania: readonly CountryData[] = [
			{ area: 7_700_000, centre: [134.4, -25.6], iso3166: "AU", region: "009", subregion: "053" },
			{ area: 811, centre: [173, 1.4], iso3166: "KI", region: "009", subregion: "057" },
		];
		const world = [...COUNTRIES, ...oceania];
		const codes = recommendationsOf(world, { JP: {} }, achievementsOf(world)).map(
			({ code }) => code,
		);

		expect(codes).toContain("AU");
		expect(codes).not.toContain("KI");
	}, 5000);

	it("should recommend countries for different things, not all for the one", () => {
		expect.hasAssertions();

		const [, second] = recommend({ BE: {}, FR: {} });

		// Luxembourg completes Western Europe as well, but having just been the reason for one
		// recommendation, that counts for less than Italy's own.
		expect(second?.code).toBe("IT");
	}, 5000);
});
