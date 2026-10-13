import { createStore } from "jotai";
import { afterEach, describe, expect, it, vi } from "vitest";

import { encodeShare } from "../utils/share";
import { visitsAtom } from "./atoms";
import { countryCodesAtom, rawCountriesAtom } from "./dataset";
import { sharedVisitsAtom } from "./location";
import {
	announceStampAtom,
	endStampMomentAtom,
	endVisaMomentAtom,
	stampCountryAtom,
	stampMomentAtom,
	visaMomentAtom,
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
		expect(store.get(stampMomentAtom)).toStrictEqual({
			code: "FR",
			id: 1,
			visas: ["milestone:1", "subregion:155"],
		});
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

		expect(ticked).toStrictEqual({ code: "FR", id: 1, visas: ["milestone:1", "subregion:155"] });
		expect(store.get(stampMomentAtom)).toBeNull();
	}, 5000);

	it("should only end the moment it is asked to, not one that took its place", () => {
		expect.hasAssertions();

		const store = createTestStore();
		store.set(announceStampAtom, "FR");
		store.set(announceStampAtom, "IT");
		store.set(endStampMomentAtom, 1);

		expect(store.get(stampMomentAtom)).toStrictEqual({ code: "IT", id: 2, visas: [] });
	}, 5000);

	it("should follow a stamp that earns achievements with their visas, once it has landed", () => {
		expect.hasAssertions();

		const store = createTestStore();
		store.set(stampCountryAtom, "FR");
		store.set(stampCountryAtom, "IT");
		const during = store.get(visaMomentAtom);
		store.set(endStampMomentAtom, 2);

		expect(during).toBeNull();
		expect(store.get(visaMomentAtom)).toStrictEqual({
			id: 2,
			ids: ["milestone:all", "region:150", "subregion:039"],
		});
	}, 5000);

	it("should end the visa moment it is asked to", () => {
		expect.hasAssertions();

		const store = createTestStore();
		store.set(stampCountryAtom, "FR");
		store.set(endStampMomentAtom, 1);
		const playing = store.get(visaMomentAtom);
		store.set(endVisaMomentAtom, 1);

		expect(playing?.ids).toStrictEqual(["milestone:1", "subregion:155"]);
		expect(store.get(visaMomentAtom)).toBeNull();
	}, 5000);

	it("should cut a visa moment short for a newer stamp", () => {
		expect.hasAssertions();

		const store = createTestStore();
		store.set(stampCountryAtom, "FR");
		store.set(endStampMomentAtom, 1);
		store.set(stampCountryAtom, "IT");

		expect(store.get(visaMomentAtom)).toBeNull();
	}, 5000);
});
