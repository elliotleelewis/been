import { createStore } from "jotai";
import { afterEach, describe, expect, it } from "vitest";

import { rawCountriesAtom } from "./dataset.ts";
import { visitsAtom } from "./selection.ts";
import { openSharedMap } from "./test.ts";
import {
	announceStampAtom,
	endStampMomentAtom,
	stampCountryAtom,
	stampMomentAtom,
} from "./ticking.ts";

const createTestStore = (): ReturnType<typeof createStore> => {
	const store = createStore();
	store.set(rawCountriesAtom, {
		FR: { iso3166: "FR", region: "150", subregion: "155" },
		IT: { iso3166: "IT", region: "150", subregion: "039" },
	});
	return store;
};

describe("stamping", () => {
	afterEach(() => {
		globalThis.localStorage.clear();
	});

	it("should tick a country and stamp it", () => {
		expect.hasAssertions();

		const store = createTestStore();
		store.set(stampCountryAtom, "FR");

		expect(Object.keys(store.get(visitsAtom))).toStrictEqual(["FR"]);
		expect(store.get(stampMomentAtom)).toStrictEqual({ code: "FR", id: 1 });
	}, 5000);

	it("should not stamp a country ticked already", () => {
		expect.hasAssertions();

		const store = createTestStore();
		store.set(visitsAtom, { FR: {} });
		store.set(stampCountryAtom, "FR");

		expect(store.get(stampMomentAtom)).toBeNull();
	}, 5000);

	it("should not stamp anything on a shared map", () => {
		expect.hasAssertions();

		const store = createTestStore();
		openSharedMap(store, { IT: {} });
		store.set(stampCountryAtom, "FR");

		expect(store.get(stampMomentAtom)).toBeNull();
	}, 5000);

	it("should only end the moment it is asked to, not one that took its place", () => {
		expect.hasAssertions();

		const store = createTestStore();
		store.set(announceStampAtom, "FR");
		store.set(announceStampAtom, "IT");
		store.set(endStampMomentAtom, 1);

		expect(store.get(stampMomentAtom)).toStrictEqual({ code: "IT", id: 2 });
	}, 5000);
});
