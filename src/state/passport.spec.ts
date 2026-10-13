import { createStore } from "jotai";
import { afterEach, describe, expect, it } from "vitest";

import type { CountryData } from "../models/country";
import { assertDefined } from "../utils/test";
import { focusAtom, localesAtom, visitsAtom } from "./atoms";
import { rawCountriesAtom } from "./dataset";
import { passportStampsAtom, showCountryAtom } from "./passport";
import {
	passportPageAtom,
	passportPageCountAtom,
	passportPagesAtom,
	passportStatsAtom,
	turnPassportPageAtom,
} from "./passport-pages";
import { homeRegionAtom } from "./regions";

const COUNTRIES: readonly CountryData[] = [
	{ iso3166: "FR", region: "150", subregion: "155" },
	{ iso3166: "IT", region: "150", subregion: "039" },
	{ iso3166: "JP", region: "142", subregion: "030" },
	{ iso3166: "KE", region: "002", subregion: "014" },
];

const createTestStore = (): ReturnType<typeof createStore> => {
	const store = createStore();
	store.set(localesAtom, ["en-GB"]);
	store.set(homeRegionAtom, "150");
	store.set(
		rawCountriesAtom,
		Object.fromEntries(COUNTRIES.map((country) => [country.iso3166, country])),
	);
	store.set(visitsAtom, { FR: { at: "2026-10-13" }, IT: {}, JP: { at: "2025-03-01" } });
	return store;
};

describe("passport state", () => {
	// `visitsAtom` is backed by local storage, which outlives an individual store.
	afterEach(() => {
		globalThis.localStorage.clear();
	});

	it("should order stamps as they went in, older undated ticks first", () => {
		expect.hasAssertions();

		const stamps = createTestStore().get(passportStampsAtom);

		expect(stamps.map(({ country }) => country.iso3166)).toStrictEqual(["IT", "JP", "FR"]);
		expect(stamps.map(({ date }) => date)).toStrictEqual([undefined, "01 MAR 2025", "13 OCT 2026"]);
	}, 5000);

	it("should sum the map up for the identity page", () => {
		expect.hasAssertions();

		expect(createTestStore().get(passportStatsAtom)).toStrictEqual({
			count: 3,
			first: "01 MAR 2025",
			home: "Europe",
			latest: "13 OCT 2026",
			regions: 2,
			total: 4,
			visaTotal: 9,
			visas: 6,
		});
	}, 5000);

	it("should turn pages, stopping at either cover", () => {
		expect.hasAssertions();

		const store = createTestStore();
		store.set(turnPassportPageAtom, -1);
		const atFront = store.get(passportPageAtom);
		store.set(turnPassportPageAtom, 10);

		expect(atFront).toBe(0);
		expect(store.get(passportPageCountAtom)).toBe(6);
		expect(store.get(passportPageAtom)).toBe(5);
	}, 5000);

	it("should put a page of visas for every two earned before the stamps", () => {
		expect.hasAssertions();

		const pages = createTestStore().get(passportPagesAtom);

		expect(pages.map(({ kind }) => kind)).toStrictEqual([
			"cover",
			"identity",
			"visas",
			"visas",
			"visas",
			"stamps",
		]);
	}, 5000);

	it("should frame a stamp's country on the globe", () => {
		expect.hasAssertions();

		const store = createTestStore();
		const [stamp] = store.get(passportStampsAtom);
		store.set(showCountryAtom, assertDefined(stamp, "The passport has no stamps.").country);

		expect(store.get(focusAtom)?.type).toBe("country");
	}, 5000);
});
