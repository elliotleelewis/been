import { createStore } from "jotai";
import { afterEach, describe, expect, it, vi } from "vitest";

import { countries } from "../data/countries";
import type { Visits } from "../models/country";
import { encodeShare } from "../utils/share";
import { addCountryAtom, selectedCountriesAtom, visitsAtom } from "./atoms";
import { countryCodesAtom, rawCountriesAtom } from "./dataset";
import { leaveSharedMapAtom, sharedVisitsAtom, viewingSharedMapAtom } from "./location";
import { tapCountryAtom } from "./taps";

const RAW_COUNTRIES = Object.fromEntries(countries.map((country) => [country.iso3166, country]));

/** Opens a share link the way following one would, and returns a store watching the location. */
const openShareLink = (
	hash: string,
	rawCountries: typeof RAW_COUNTRIES = RAW_COUNTRIES,
): ReturnType<typeof createStore> => {
	const store = createStore();
	store.set(rawCountriesAtom, rawCountries);
	// The hash is only read again once something is watching it, as a component would be.
	store.sub(sharedVisitsAtom, vi.fn<() => void>());
	globalThis.history.replaceState(null, "", hash);
	globalThis.dispatchEvent(new globalThis.HashChangeEvent("hashchange"));
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
		globalThis.history.replaceState(null, "", globalThis.location.pathname);
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
		store.set(tapCountryAtom, "ES");

		expect(store.get(visitsAtom)).toStrictEqual({});
	}, 5000);

	it("should go back to the reader's own map, and take the link off the address", () => {
		expect.hasAssertions();

		const store = openShareLink(linkFor({ FR: {} }));
		store.set(leaveSharedMapAtom);

		expect(store.get(viewingSharedMapAtom)).toBeFalsy();
		expect(globalThis.location.hash).toBe("");
	}, 5000);
});
