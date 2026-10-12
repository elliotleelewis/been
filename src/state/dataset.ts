import { atom } from "jotai";

import type { CountryData } from "../models/country.ts";

/** The country list, keyed by ISO 3166-1 alpha-2 code, empty until it has loaded. */
export const rawCountriesAtom = atom<Readonly<Record<string, CountryData>>>({});

/**
 * Every country's code, sorted, which is the order a share link marks countries in. It is empty
 * until the country list has loaded.
 */
export const countryCodesAtom = atom<readonly string[]>((get) =>
	Object.keys(get(rawCountriesAtom)).toSorted(),
);
