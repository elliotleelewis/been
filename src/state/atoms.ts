import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import type { Country, CountryData, Visits } from "../models/country.ts";
import type { Focus } from "../models/focus.ts";
import { MENU_SIZE_DEFAULT } from "../models/menu.ts";
import type { MenuSize } from "../models/menu.ts";
import type { Continent } from "../models/region.ts";
import { regionalizer } from "../utils/regionalizer.ts";
import { isVisits, withoutVisit } from "../utils/visits.ts";
import { homeRegionAtom } from "./regions.ts";
import { validatedStorage } from "./storage.ts";

const COUNTRIES_STORAGE_KEY = "APP_COUNTRIES";
const MENU_SIZE_STORAGE_KEY = "APP_MENU_SIZE";

export const rawCountriesAtom = atom<Record<string, CountryData>>({});
/**
 * The languages the reader prefers, most preferred first, which every name and ordering follows.
 */
export const localesAtom = atom<readonly string[]>(globalThis.navigator.languages);
export const visitsAtom = atomWithStorage<Visits>(
	COUNTRIES_STORAGE_KEY,
	{},
	validatedStorage(isVisits),
	{ getOnInit: true },
);
export const focusAtom = atom<Focus | null>(null);

/**
 * Where the user dragged the edge of the country drawer to, kept so it is still there next time.
 */
export const menuSizeAtom = atomWithStorage<MenuSize>(
	MENU_SIZE_STORAGE_KEY,
	MENU_SIZE_DEFAULT,
	undefined,
	{ getOnInit: true },
);

const countryNamesAtom = atom((get) => new Intl.DisplayNames(get(localesAtom), { type: "region" }));
const collatorAtom = atom((get) => new Intl.Collator(get(localesAtom)));

export const selectedCountriesAtom = atom<readonly string[]>((get) => Object.keys(get(visitsAtom)));
export const countriesAtom = atom<readonly Country[]>((get) => {
	const rawCountries = get(rawCountriesAtom);
	const visits = get(visitsAtom);
	const countryNames = get(countryNamesAtom);

	// Spread into a new object rather than mutating `country`. Mutating it in place would keep
	// the same object identity, so `memo`'d consumers such as `MenuItem` would never re-render.
	// oxlint-disable-next-line no-map-spread -- The in-place mutation it suggests is what the new object identity is avoiding.
	return Object.values(rawCountries).map((country) => ({
		...country,
		name: countryNames.of(country.iso3166) ?? country.iso3166,
		selected: Object.hasOwn(visits, country.iso3166),
	}));
});
export const continentsAtom = atom<readonly Continent[]>((get) =>
	regionalizer(get(countriesAtom), get(collatorAtom), get(homeRegionAtom)),
);

export const addCountryAtom = atom(undefined, (get, set, countryCode: string) => {
	const visits = get(visitsAtom);
	if (!Object.hasOwn(visits, countryCode)) {
		const countries = get(countriesAtom);
		const focusCountry = countries.find((country) => country.iso3166 === countryCode);
		set(focusAtom, focusCountry ? { country: focusCountry, type: "country" } : null);
		set(visitsAtom, { ...visits, [countryCode]: {} });
	}
});
export const removeCountryAtom = atom(undefined, (get, set, countryCode: string) => {
	const visits = get(visitsAtom);
	const focus = get(focusAtom);

	// Unselecting the country the map is currently framing is an undo of that selection, so ask
	// the map to go back to where it was rather than leaving the user stranded on a country they
	// no longer have selected. Unselecting anything else just leaves the camera alone.
	const undo = focus?.type === "country" && focus.country.iso3166 === countryCode;
	set(focusAtom, undo ? { type: "undo" } : null);
	set(visitsAtom, withoutVisit(visits, countryCode));
});
