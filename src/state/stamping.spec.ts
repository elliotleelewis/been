import { createStore } from "jotai";
import { afterEach, describe, expect, it, vi } from "vitest";

import { encodeShare } from "../utils/share";
import { visitsAtom } from "./atoms";
import { countryCodesAtom, rawCountriesAtom } from "./dataset";
import { sharedVisitsAtom } from "./location";
import {
	announceStampAtom,
	endStampMomentAtom,
	stampCountryAtom,
	stampMomentAtom,
} from "./stamping";
import { tapCountryAtom } from "./taps";

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
		globalThis.history.replaceState(null, "", globalThis.location.pathname);
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
		store.sub(sharedVisitsAtom, vi.fn<() => void>());
		globalThis.history.replaceState(
			null,
			"",
			`#share=${encodeShare({ IT: {} }, store.get(countryCodesAtom))}`,
		);
		globalThis.dispatchEvent(new globalThis.HashChangeEvent("hashchange"));
		store.set(stampCountryAtom, "FR");

		expect(store.get(stampMomentAtom)).toBeNull();
	}, 5000);

	it("should stamp a country tapped on the globe, but not one tapped off", () => {
		expect.hasAssertions();

		const store = createTestStore();
		store.set(tapCountryAtom, "FR");
		const ticked = store.get(stampMomentAtom);
		store.set(endStampMomentAtom, 1);
		store.set(tapCountryAtom, "FR");

		expect(ticked).toStrictEqual({ code: "FR", id: 1 });
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
