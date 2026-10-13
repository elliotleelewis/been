import { createStore } from "jotai";
import { afterEach, describe, expect, it } from "vitest";

import { rawCountriesAtom } from "../core/dataset.ts";
import { stampCountryAtom, stampMomentAtom } from "../core/ticking.ts";
import {
	endVisaMomentAtom,
	landStampAtom,
	shownVisaMomentAtom,
	visaMomentAtom,
} from "./moments.ts";

const createTestStore = (): ReturnType<typeof createStore> => {
	const store = createStore();
	store.set(rawCountriesAtom, {
		FR: { iso3166: "FR", region: "150", subregion: "155" },
		IT: { iso3166: "IT", region: "150", subregion: "039" },
	});
	return store;
};

describe("moments", () => {
	// `visitsAtom` is backed by local storage, which outlives an individual store.
	afterEach(() => {
		globalThis.localStorage.clear();
	});

	it("should follow a stamp that earns achievements with their visas, once it has landed", () => {
		expect.hasAssertions();

		const store = createTestStore();
		store.set(stampCountryAtom, "FR");
		store.set(landStampAtom, 1);
		store.set(stampCountryAtom, "IT");
		store.set(landStampAtom, 2);

		expect(store.get(stampMomentAtom)).toBeNull();
		expect(store.get(visaMomentAtom)).toStrictEqual({
			id: 2,
			ids: ["milestone:all", "region:150", "subregion:039"],
		});
	}, 5000);

	it("should hold the visa moment back while a newer stamp is on screen", () => {
		expect.hasAssertions();

		const store = createTestStore();
		store.set(stampCountryAtom, "FR");
		store.set(landStampAtom, 1);
		store.set(stampCountryAtom, "IT");

		expect(store.get(visaMomentAtom)?.id).toBe(1);
		expect(store.get(shownVisaMomentAtom)).toBeNull();
	}, 5000);

	it("should only land the stamp it is asked to, not one that took its place", () => {
		expect.hasAssertions();

		const store = createTestStore();
		store.set(stampCountryAtom, "FR");
		store.set(stampCountryAtom, "IT");
		store.set(landStampAtom, 1);

		expect(store.get(stampMomentAtom)).toStrictEqual({ code: "IT", id: 2 });
		expect(store.get(visaMomentAtom)).toBeNull();
	}, 5000);

	it("should end the visa moment it is asked to", () => {
		expect.hasAssertions();

		const store = createTestStore();
		store.set(stampCountryAtom, "FR");
		store.set(landStampAtom, 1);
		const playing = store.get(visaMomentAtom);
		store.set(endVisaMomentAtom, 2);
		store.set(endVisaMomentAtom, 1);

		expect(playing?.ids).toStrictEqual(["milestone:1", "subregion:155"]);
		expect(store.get(visaMomentAtom)).toBeNull();
	}, 5000);
});
