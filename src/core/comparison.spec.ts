import { createStore } from "jotai";
import { afterEach, describe, expect, it } from "vitest";

import { countries } from "../data/countries.ts";
import { comparisonAtom, replyComparisonAtom } from "./comparison.ts";
import { countriesAtom } from "./countries.ts";
import { rawCountriesAtom } from "./dataset.ts";
import { recommendedCodesAtom } from "./recommended.ts";
import { visitsAtom } from "./selection.ts";
import { leaveSharedMap, openSharedMap } from "./test.ts";

const RAW_COUNTRIES = Object.fromEntries(countries.map((country) => [country.iso3166, country]));

/** A store with the whole country list, and the reader's own map of France and Spain. */
const createTestStore = (): ReturnType<typeof createStore> => {
	const store = createStore();
	store.set(rawCountriesAtom, RAW_COUNTRIES);
	store.set(visitsAtom, { ES: { at: "2026-10-13" }, FR: { at: "2026-10-14" } });
	return store;
};

describe("comparison", () => {
	afterEach(() => {
		globalThis.localStorage.clear();
	});

	it("should set a shared map against the reader's own", () => {
		expect.hasAssertions();

		const store = createTestStore();
		openSharedMap(store, { FR: {}, IT: {}, JP: {} });

		expect(store.get(comparisonAtom)).toStrictEqual({
			both: ["FR"],
			mine: ["ES"],
			theirs: ["IT", "JP"],
		});
	}, 5000);

	it("should mark each country with where it stands", () => {
		expect.hasAssertions();

		const store = createTestStore();
		openSharedMap(store, { FR: {}, IT: {} });
		const standings = Object.fromEntries(
			store
				.get(countriesAtom)
				.filter(({ standing }) => standing !== undefined)
				.map(({ iso3166, standing }) => [iso3166, standing]),
		);

		expect(standings).toStrictEqual({ ES: "mine", FR: "both", IT: "theirs" });
	}, 5000);

	it("should compare nothing on the reader's own map", () => {
		expect.hasAssertions();

		const store = createTestStore();

		expect(store.get(comparisonAtom)).toBeNull();
		expect(store.get(countriesAtom).some(({ standing }) => standing !== undefined)).toBeFalsy();
	}, 5000);

	it("should compare nothing until the reader has a map of their own", () => {
		expect.hasAssertions();

		const store = createTestStore();
		store.set(visitsAtom, {});
		openSharedMap(store, { FR: {} });

		expect(store.get(comparisonAtom)).toBeNull();
	}, 5000);

	it("should recommend only the shared map's countries new to the reader", () => {
		expect.hasAssertions();

		const store = createTestStore();
		openSharedMap(store, { FR: {}, IT: {}, JP: {}, PT: {} });

		expect(store.get(recommendedCodesAtom).toSorted()).toStrictEqual(["IT", "JP", "PT"]);
	}, 5000);

	it("should recommend nothing on a shared map with nothing to compare it with", () => {
		expect.hasAssertions();

		const store = createTestStore();
		store.set(visitsAtom, {});
		openSharedMap(store, { IT: {} });

		expect(store.get(recommendedCodesAtom)).toStrictEqual([]);
	}, 5000);

	it("should keep the shared map the reader opened to reply to, after they leave it", () => {
		expect.hasAssertions();

		const store = createTestStore();
		openSharedMap(store, { FR: {}, IT: {}, JP: {} });
		leaveSharedMap(store);

		expect(store.get(comparisonAtom)).toBeNull();
		expect(store.get(replyComparisonAtom)).toStrictEqual({
			both: ["FR"],
			mine: ["ES"],
			theirs: ["IT", "JP"],
		});
	}, 5000);

	it("should have nothing to reply to before the reader has a map, or on their own map", () => {
		expect.hasAssertions();

		const store = createTestStore();

		expect(store.get(replyComparisonAtom)).toBeNull();

		openSharedMap(store, { ES: {}, FR: {} });

		expect(store.get(replyComparisonAtom)).toBeNull();

		store.set(visitsAtom, {});
		openSharedMap(store, { IT: {} });

		expect(store.get(replyComparisonAtom)).toBeNull();
	}, 5000);
});
