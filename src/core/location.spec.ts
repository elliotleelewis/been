import { createStore } from "jotai";
import { afterEach, describe, expect, it } from "vitest";

import { countries } from "../data/countries.ts";
import { countryCodesAtom, rawCountriesAtom } from "./dataset.ts";
import { locationHashAtom, viewingSharedMapAtom } from "./location.ts";
import { selectedCountriesAtom, visitsAtom } from "./selection.ts";
import { encodeShare } from "./share-link.ts";
import { addCountryAtom, stampCountryAtom } from "./ticking.ts";
import type { Visits } from "./types.ts";

const RAW_COUNTRIES = Object.fromEntries(countries.map((country) => [country.iso3166, country]));

/** Opens a share link as the router arriving at one does, through the mirror of its location. */
const openShareLink = (
	hash: string,
	rawCountries: typeof RAW_COUNTRIES = RAW_COUNTRIES,
): ReturnType<typeof createStore> => {
	const store = createStore();
	store.set(rawCountriesAtom, rawCountries);
	store.set(locationHashAtom, hash);
	return store;
};

/** A share link's hash for `visits`, written against the whole country list. */
const linkFor = (visits: Visits): string => {
	const store = createStore();
	store.set(rawCountriesAtom, RAW_COUNTRIES);
	return `#share=${encodeShare(visits, store.get(countryCodesAtom))}`;
};

describe("location", () => {
	afterEach(() => {
		globalThis.localStorage.clear();
	});

	it("should show the map a share link carries in place of the reader's own", () => {
		expect.hasAssertions();

		const store = openShareLink(linkFor({ FR: {}, IT: {} }));
		store.set(visitsAtom, { GB: {} });

		expect(store.get(viewingSharedMapAtom)).toBeTruthy();
		expect(store.get(selectedCountriesAtom)).toStrictEqual(["FR", "IT"]);
	}, 5000);

	it("should show a shared map empty, not the reader's own, until the country list loads", () => {
		expect.hasAssertions();

		const store = openShareLink(linkFor({ FR: {} }), {});
		store.set(visitsAtom, { GB: {} });

		expect(store.get(viewingSharedMapAtom)).toBeTruthy();
		expect(store.get(selectedCountriesAtom)).toStrictEqual([]);
	}, 5000);

	it("should open the reader's own map for a link it cannot read", () => {
		expect.hasAssertions();

		const store = openShareLink("#share=9.nonsense");

		expect(store.get(viewingSharedMapAtom)).toBeFalsy();
	}, 5000);

	it("should leave the reader's own map alone while a shared one is on show", () => {
		expect.hasAssertions();

		const store = openShareLink(linkFor({ FR: {} }));
		store.set(addCountryAtom, "DE");
		store.set(stampCountryAtom, "ES");

		expect(store.get(visitsAtom)).toStrictEqual({});
	}, 5000);

	it("should go back to the reader's own map once the router leaves the link", () => {
		expect.hasAssertions();

		const store = openShareLink(linkFor({ FR: {} }));
		store.set(locationHashAtom, "");

		expect(store.get(viewingSharedMapAtom)).toBeFalsy();
	}, 5000);
});
