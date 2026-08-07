import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { Country } from "../models/country.ts";
import type { Focus } from "../models/focus.ts";
import type { Region } from "../models/region.ts";
import { regionalizer } from "../utils/regionalizer.ts";

const COUNTRIES_STORAGE_KEY = "APP_COUNTRIES";

export const rawCountriesAtom = atom<Record<string, Country>>({});
export const selectedCountriesAtom = atomWithStorage<readonly string[]>(
	COUNTRIES_STORAGE_KEY,
	[],
	undefined,
	{ getOnInit: true },
);
export const focusAtom = atom<Focus | null>(null);

export const countriesAtom = atom<readonly Country[]>((get) => {
	const rawCountries = get(rawCountriesAtom);
	const selectedCountries = get(selectedCountriesAtom);

	// Spread into a new object rather than mutating `country`. Mutating it in place would keep
	// the same object identity, so `memo`'d consumers such as `MenuItem` would never re-render.
	// oxlint-disable-next-line no-map-spread -- The in-place mutation it suggests is what the new object identity is avoiding.
	return Object.values(rawCountries).map((country) => ({
		...country,
		selected: selectedCountries.includes(country.iso3166),
	}));
});
export const regionsAtom = atom<readonly Region[]>((get) => {
	const countries = get(countriesAtom);
	return regionalizer(countries);
});

export const addCountryAtom = atom(undefined, (get, set, countryCode: string) => {
	const selectedCountries = get(selectedCountriesAtom);
	if (!selectedCountries.includes(countryCode)) {
		const countries = get(countriesAtom);
		const focusCountry = countries.find((country) => country.iso3166 === countryCode);
		set(focusAtom, focusCountry ? { country: focusCountry, type: "country" } : null);
		set(selectedCountriesAtom, [...selectedCountries, countryCode]);
	}
});
export const removeCountryAtom = atom(undefined, (get, set, countryCode: string) => {
	const selectedCountries = get(selectedCountriesAtom);
	const focus = get(focusAtom);

	// Unselecting the country the map is currently framing is an undo of that selection, so ask
	// the map to go back to where it was rather than leaving the user stranded on a country they
	// no longer have selected. Unselecting anything else just leaves the camera alone.
	const undo = focus?.type === "country" && focus.country.iso3166 === countryCode;
	set(focusAtom, undo ? { type: "undo" } : null);
	set(
		selectedCountriesAtom,
		selectedCountries.filter((code) => code !== countryCode),
	);
});
