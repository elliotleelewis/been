import { describe, expect, it } from "vitest";

import type { CountryData } from "../core/types.ts";
import { summaryOf } from "./summary.ts";

/** Ten European countries, two Asian, and one in Oceania. */
const COUNTRIES: readonly CountryData[] = [
	...["AT", "BE", "CH", "DE", "ES", "FR", "IT", "NL", "PT", "SE"].map((iso3166): CountryData => ({
		iso3166,
		region: "150",
		subregion: "155",
	})),
	{ iso3166: "CN", region: "142", subregion: "030" },
	{ iso3166: "JP", region: "142", subregion: "030" },
	{ iso3166: "FJ", region: "009", subregion: "054" },
];

describe("summary", () => {
	it("should give each continent a bar in its stamps' ink, the furthest through first", () => {
		expect.hasAssertions();

		const summary = summaryOf({
			countries: COUNTRIES,
			tiers: [],
			url: undefined,
			visits: { DE: {}, ES: {}, FR: {}, IT: {}, JP: {}, NL: {} },
		});

		expect(summary).toBe(
			[
				"been · 6/13 countries (46%) 🌍",
				"",
				"🟪🟪🟪🟪🟪⬜⬜⬜⬜⬜ Europe 5/10",
				"🟥🟥🟥🟥🟥⬜⬜⬜⬜⬜ Asia 1/2",
				"⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ Oceania 0/1",
			].join("\n"),
		);
	}, 5000);

	it("should fill a bar only once a continent is done, but show any visit at all", () => {
		expect.hasAssertions();

		const nine = ["AT", "BE", "CH", "DE", "ES", "FR", "IT", "NL", "PT"];
		const many = Array.from({ length: 30 }, (_country, index): CountryData => ({
			iso3166: `X${String(index)}`,
			region: "002",
			subregion: "014",
		}));
		const summary = summaryOf({
			countries: [...COUNTRIES, ...many],
			tiers: [],
			url: undefined,
			visits: Object.fromEntries([...nine, "X0", "FJ"].map((code) => [code, {}])),
		});

		expect(summary).toContain("🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫 Oceania 1/1");
		expect(summary).toContain("🟪🟪🟪🟪🟪🟪🟪🟪🟪⬜ Europe 9/10");
		expect(summary).toContain("🟩⬜⬜⬜⬜⬜⬜⬜⬜⬜ Africa 1/30");
	}, 5000);

	it("should count the visas, the rare ones among them, and end with the link if given", () => {
		expect.hasAssertions();

		const summary = summaryOf({
			countries: COUNTRIES,
			tiers: ["standard", "foil", "foil", "legendary", "standard"],
			url: "https://been.example/#map",
			visits: { FR: {} },
		});

		expect(summary.split("\n").slice(-3)).toStrictEqual([
			"🛂 5 visas · ✨ 2 foil · 🌟 1 legendary",
			"",
			"https://been.example/#map",
		]);
	}, 5000);
});
