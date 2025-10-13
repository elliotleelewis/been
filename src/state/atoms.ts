import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { Country } from "../models/country.ts";
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
export const focusAtom = atom<Country | null>(null);

export const countriesAtom = atom<readonly Country[]>((get) => {
	const rawCountries = get(rawCountriesAtom);
	const selectedCountries = get(selectedCountriesAtom);

	return Object.values(rawCountries).map((c) =>
		Object.assign(c, {
			selected: selectedCountries.includes(c.iso3166),
		}),
	);
});
export const regionsAtom = atom<readonly Region[]>((get) => {
	const countries = get(countriesAtom);
	return regionalizer(countries);
});

export const addCountryAtom = atom(null, (get, set, countryCode: string) => {
	const selectedCountries = get(selectedCountriesAtom);
	if (!selectedCountries.includes(countryCode)) {
		const countries = get(countriesAtom);
		const focusCountry =
			countries.find((c) => c.iso3166 === countryCode) ?? null;
		set(focusAtom, focusCountry);
		set(selectedCountriesAtom, [...selectedCountries, countryCode]);
	}
});
export const removeCountryAtom = atom(null, (get, set, countryCode: string) => {
	const selectedCountries = get(selectedCountriesAtom);
	set(focusAtom, null);
	set(
		selectedCountriesAtom,
		selectedCountries.filter((c) => c !== countryCode),
	);
});
