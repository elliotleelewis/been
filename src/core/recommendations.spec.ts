import { describe, expect, it } from "vitest";

import { achievementsOf } from "./achievements.ts";
import { recommendationsOf } from "./recommendations.ts";
import type { CountryData, Visits } from "./types.ts";

/**
 * A small world: France and its neighbours Belgium and Luxembourg, Western Europe all three, then
 * Italy beside France, and China, Japan and South Korea a world away.
 */
const COUNTRIES: readonly CountryData[] = [
	{
		bounds: [2.5, 49.5, 6.4, 51.5],
		iso3166: "BE",
		neighbours: ["FR", "LU"],
		region: "150",
		subregion: "155",
	},
	{ bounds: [73, 18, 135, 53], iso3166: "CN", region: "142", subregion: "030" },
	{
		bounds: [-5, 42, 8, 51],
		iso3166: "FR",
		neighbours: ["BE", "IT", "LU"],
		region: "150",
		subregion: "155",
	},
	{
		bounds: [6.6, 36, 18.5, 47],
		iso3166: "IT",
		neighbours: ["FR"],
		region: "150",
		subregion: "039",
	},
	{ bounds: [129, 31, 146, 45], iso3166: "JP", region: "142", subregion: "030" },
	{
		bounds: [5.7, 49.4, 6.5, 50.2],
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
			{ achievement: { id: "subregion:155" }, kind: "achievement", remaining: 1 },
			{ achievement: { id: "region:150" }, kind: "achievement", remaining: 2 },
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

		// Japan would be Asia's first, but Italy is next door.
		expect(codes[0]).toBe("IT");
		expect(codes.indexOf("IT")).toBeLessThan(codes.indexOf("JP"));
	}, 5000);
});
