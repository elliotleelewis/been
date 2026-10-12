import { createStore } from "jotai";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Country } from "../models/country";
import {
	addCountryAtom,
	countriesAtom,
	focusAtom,
	localesAtom,
	removeCountryAtom,
	visitsAtom,
} from "./atoms";
import { rawCountriesAtom } from "./dataset";

const unitedKingdom: Country = {
	bounds: [-8.65, 49.87, 1.76, 60.86],
	iso3166: "GB",
	name: "United Kingdom",
	region: "150",
	subregion: "154",
};
const france: Country = {
	bounds: [-5.14, 41.33, 9.56, 51.09],
	iso3166: "FR",
	name: "France",
	region: "150",
	subregion: "155",
};

const createTestStore = (): ReturnType<typeof createStore> => {
	const store = createStore();
	store.set(rawCountriesAtom, { [unitedKingdom.iso3166]: unitedKingdom, [france.iso3166]: france });
	return store;
};

describe("atoms", () => {
	// `visitsAtom` is backed by local storage, which outlives an individual store.
	beforeEach(() => {
		globalThis.localStorage.clear();
	});
	afterEach(() => {
		globalThis.localStorage.clear();
	});

	it("should focus a country when it is selected", () => {
		expect.hasAssertions();

		const store = createTestStore();

		store.set(addCountryAtom, unitedKingdom.iso3166);

		// `countriesAtom` decorates the raw country with its selected state before the focus is set.
		expect(store.get(focusAtom)).toStrictEqual({
			country: { ...unitedKingdom, selected: false },
			type: "country",
		});
	}, 5000);

	it("should undo the focus when the focused country is unselected", () => {
		expect.hasAssertions();

		const store = createTestStore();

		store.set(addCountryAtom, unitedKingdom.iso3166);
		store.set(removeCountryAtom, unitedKingdom.iso3166);

		expect(store.get(focusAtom)).toStrictEqual({ type: "undo" });
	}, 5000);

	it("should not undo the focus when another country is unselected", () => {
		expect.hasAssertions();

		const store = createTestStore();

		store.set(addCountryAtom, france.iso3166);
		store.set(addCountryAtom, unitedKingdom.iso3166);
		store.set(removeCountryAtom, france.iso3166);

		expect(store.get(focusAtom)).toBeNull();
	}, 5000);

	it("should only undo a focus once", () => {
		expect.hasAssertions();

		const store = createTestStore();

		store.set(addCountryAtom, unitedKingdom.iso3166);
		store.set(removeCountryAtom, unitedKingdom.iso3166);
		store.set(removeCountryAtom, unitedKingdom.iso3166);

		expect(store.get(focusAtom)).toBeNull();
	}, 5000);

	it("should store a visit for each selected country", () => {
		expect.hasAssertions();

		const store = createTestStore();

		store.set(addCountryAtom, france.iso3166);
		store.set(addCountryAtom, unitedKingdom.iso3166);
		store.set(removeCountryAtom, france.iso3166);

		expect(store.get(visitsAtom)).toStrictEqual({ [unitedKingdom.iso3166]: {} });
		expect(globalThis.localStorage.getItem("APP_COUNTRIES")).toBe(
			JSON.stringify({ [unitedKingdom.iso3166]: {} }),
		);
	}, 5000);

	it("should clear stored selections that are not in the current shape", () => {
		expect.hasAssertions();

		globalThis.localStorage.setItem("APP_COUNTRIES", JSON.stringify([france.iso3166]));
		const store = createTestStore();
		// Storage is read again when the atom mounts, which is when a component first uses it.
		store.sub(visitsAtom, vi.fn<() => void>());

		expect(store.get(visitsAtom)).toStrictEqual({});
		expect(globalThis.localStorage.getItem("APP_COUNTRIES")).toBeNull();
	}, 5000);

	it("should name countries in the reader's language", () => {
		expect.hasAssertions();

		const store = createTestStore();
		store.set(localesAtom, ["fr"]);

		expect(store.get(countriesAtom).map(({ name }) => name)).toStrictEqual([
			"Royaume-Uni",
			"France",
		]);
	}, 5000);
});
