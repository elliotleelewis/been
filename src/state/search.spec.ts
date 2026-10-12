import { createStore } from "jotai";
import { afterEach, describe, expect, it } from "vitest";

import type { Country } from "../models/country";
import { focusAtom, localesAtom, rawCountriesAtom, visitsAtom } from "./atoms";
import { searchAtom, searchResultsAtom, submitSearchAtom } from "./search";

const france: Country = { iso3166: "FR", name: "France", region: "150", subregion: "155" };
const finland: Country = { iso3166: "FI", name: "Finland", region: "150", subregion: "154" };
const brazil: Country = { iso3166: "BR", name: "Brazil", region: "019", subregion: "005" };

const createTestStore = (search: string): ReturnType<typeof createStore> => {
	const store = createStore();
	store.set(localesAtom, ["en"]);
	store.set(rawCountriesAtom, { BR: brazil, FI: finland, FR: france });
	store.set(searchAtom, search);
	return store;
};

describe("search state", () => {
	// `visitsAtom` is backed by local storage, which outlives an individual store.
	afterEach(() => {
		globalThis.localStorage.clear();
	});

	it("should narrow the continents to the matches, keeping their counts whole", () => {
		expect.hasAssertions();

		const { continents, matches } = createTestStore("fra").get(searchResultsAtom);

		expect(matches.map(({ name }) => name)).toStrictEqual(["France"]);
		expect(continents.map(({ name }) => name)).toStrictEqual(["Europe"]);
		expect(continents[0]?.total).toBe(2);
	}, 5000);

	it("should suggest near misses only when nothing matches", () => {
		expect.hasAssertions();

		const { continents, suggestions } = createTestStore("frnace").get(searchResultsAtom);

		expect(continents).toStrictEqual([]);
		expect(suggestions.map(({ name }) => name)).toStrictEqual(["France"]);
	}, 5000);

	it("should tick the only match on submit, and clear the search", () => {
		expect.hasAssertions();

		const store = createTestStore("fra");
		store.set(submitSearchAtom);

		expect(store.get(visitsAtom)).toStrictEqual({ FR: {} });
		expect(store.get(focusAtom)?.type).toBe("country");
		expect(store.get(searchAtom)).toBe("");
	}, 5000);

	it("should not tick anything when more than one country matches", () => {
		expect.hasAssertions();

		const store = createTestStore("f");
		store.set(submitSearchAtom);

		expect(store.get(visitsAtom)).toStrictEqual({});
		expect(store.get(searchAtom)).toBe("f");
	}, 5000);

	it("should not tick a near miss", () => {
		expect.hasAssertions();

		const store = createTestStore("frnace");
		store.set(submitSearchAtom);

		expect(store.get(visitsAtom)).toStrictEqual({});
	}, 5000);
});
