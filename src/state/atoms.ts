import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { Country } from "../models/country.ts";
import type { Focus } from "../models/focus.ts";
import type { Region } from "../models/region.ts";
import { regionalizer } from "../utils/regionalizer.ts";

const COUNTRIES_STORAGE_KEY = "APP_COUNTRIES";

const rawCountriesAtom = atom<Record<string, Country>>({});
const selectedCountriesAtom = atomWithStorage<readonly string[]>(
	COUNTRIES_STORAGE_KEY,
	[],
	undefined,
	{ getOnInit: true },
);
const focusAtom = atom<Focus | null>(null);

const countriesAtom = atom<readonly Country[]>((get) => {
	const rawCountries = get(rawCountriesAtom);
	const selectedCountries = get(selectedCountriesAtom);

	// Assign onto a new object rather than onto `c`. Mutating `c` in place would keep the
	// same object identity, so `memo`'d consumers such as `MenuItem` would never re-render.
	return Object.values(rawCountries).map((country) =>
		Object.assign({}, country, {
			selected: selectedCountries.includes(country.iso3166),
		}),
	);
});
const regionsAtom = atom<readonly Region[]>((get) => {
	const countries = get(countriesAtom);
	return regionalizer(countries);
});

const addCountryAtom = atom(undefined, (get, set, countryCode: string) => {
	const selectedCountries = get(selectedCountriesAtom);
	if (!selectedCountries.includes(countryCode)) {
		const countries = get(countriesAtom);
		const focusCountry = countries.find((country) => country.iso3166 === countryCode);
		set(focusAtom, focusCountry ? { country: focusCountry, type: "country" } : null);
		set(selectedCountriesAtom, [...selectedCountries, countryCode]);
	}
});
const removeCountryAtom = atom(undefined, (get, set, countryCode: string) => {
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

export {
	addCountryAtom,
	countriesAtom,
	focusAtom,
	rawCountriesAtom,
	regionsAtom,
	removeCountryAtom,
	selectedCountriesAtom,
};
