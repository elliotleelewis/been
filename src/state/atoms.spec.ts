import { createStore } from "jotai";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Country } from "../models/country";
import { addCountryAtom, focusAtom, rawCountriesAtom, removeCountryAtom } from "./atoms";

const unitedKingdom: Country = {
	bounds: [-8.65, 49.87, 1.76, 60.86],
	iso3166: "GB",
	name: "United Kingdom",
	region: "Europe",
};
const france: Country = {
	bounds: [-5.14, 41.33, 9.56, 51.09],
	iso3166: "FR",
	name: "France",
	region: "Europe",
};

const createTestStore = (): ReturnType<typeof createStore> => {
	const store = createStore();
	store.set(rawCountriesAtom, { [unitedKingdom.iso3166]: unitedKingdom, [france.iso3166]: france });
	return store;
};

describe("atoms", () => {
	// `selectedCountriesAtom` is backed by local storage, which outlives an individual store.
	beforeEach(() => {
		window.localStorage.clear();
	});
	afterEach(() => {
		window.localStorage.clear();
	});

	it("should focus a country when it is selected", () => {
		const store = createTestStore();

		store.set(addCountryAtom, unitedKingdom.iso3166);

		// `countriesAtom` decorates the raw country with its selected state before the focus is set.
		expect(store.get(focusAtom)).toEqual({
			type: "country",
			country: Object.assign({}, unitedKingdom, { selected: false }),
		});
	}, 5000);

	it("should undo the focus when the focused country is unselected", () => {
		const store = createTestStore();

		store.set(addCountryAtom, unitedKingdom.iso3166);
		store.set(removeCountryAtom, unitedKingdom.iso3166);

		expect(store.get(focusAtom)).toEqual({ type: "undo" });
	}, 5000);

	it("should not undo the focus when another country is unselected", () => {
		const store = createTestStore();

		store.set(addCountryAtom, france.iso3166);
		store.set(addCountryAtom, unitedKingdom.iso3166);
		store.set(removeCountryAtom, france.iso3166);

		expect(store.get(focusAtom)).toBeNull();
	}, 5000);

	it("should only undo a focus once", () => {
		const store = createTestStore();

		store.set(addCountryAtom, unitedKingdom.iso3166);
		store.set(removeCountryAtom, unitedKingdom.iso3166);
		store.set(removeCountryAtom, unitedKingdom.iso3166);

		expect(store.get(focusAtom)).toBeNull();
	}, 5000);
});
