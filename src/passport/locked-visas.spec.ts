import { createStore } from "jotai";
import { afterEach, describe, expect, it } from "vitest";

import { localesAtom } from "../core/countries.ts";
import { rawCountriesAtom } from "../core/dataset.ts";
import { visitsAtom } from "../core/selection.ts";
import { lockedVisasAtom } from "./locked-visas.ts";

/** A store for a map of France in a world of three Western European countries and Japan. */
const createTestStore = (): ReturnType<typeof createStore> => {
	const store = createStore();
	store.set(localesAtom, ["en-GB"]);
	store.set(rawCountriesAtom, {
		BE: { iso3166: "BE", region: "150", subregion: "155" },
		FR: { iso3166: "FR", region: "150", subregion: "155" },
		JP: { iso3166: "JP", region: "142", subregion: "030" },
		LU: { iso3166: "LU", region: "150", subregion: "155" },
	});
	store.set(visitsAtom, { FR: {} });
	return store;
};

describe("locked visas", () => {
	// `visitsAtom` is backed by local storage, which outlives an individual store.
	afterEach(() => {
		globalThis.localStorage.clear();
	});

	it("should show the visas the map has started on, nearest first, and none it has not", () => {
		expect.hasAssertions();

		const locked = createTestStore().get(lockedVisasAtom);
		const ids = locked.map(({ achievement }) => achievement.id);

		expect(ids).toContain("region:150");
		expect(ids).not.toContain("region:142");
		expect(locked.find(({ achievement }) => achievement.id === "region:150")).toMatchObject({
			date: undefined,
			groups: [{ label: undefined, need: 2 }],
			remaining: 2,
		});
	}, 5000);

	it("should list the countries that would earn one, marking those recommended next", () => {
		expect.hasAssertions();

		const europe = createTestStore()
			.get(lockedVisasAtom)
			.find(({ achievement }) => achievement.id === "region:150");

		expect(
			europe?.groups[0]?.open.map(({ country, recommended }) => [country.iso3166, recommended]),
		).toStrictEqual([
			["BE", true],
			["LU", true],
		]);
	}, 5000);
});
