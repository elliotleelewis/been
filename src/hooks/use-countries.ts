import { useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";

import type { CountryData } from "../models/country";
import { rawCountriesAtom } from "../state/atoms.ts";

/**
 * React Compiler cannot lower an import expression, so the dynamic import that keeps the country
 * list out of the main bundle sits at module scope rather than inside the effect that calls it.
 */
const loadCountries = async (): Promise<readonly CountryData[]> => {
	const { countries } = await import("../data/countries");
	return countries;
};

/** Where loading the country list has got to. */
export interface CountriesLoad {
	readonly error: Error | null | undefined;
	readonly loading: boolean;
}

/** Loads the country list into `rawCountriesAtom` once, saying how that is going as it does. */
export const useCountries = (): CountriesLoad => {
	const setRawCountries = useSetAtom(rawCountriesAtom);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>();

	useEffect(() => {
		loadCountries()
			.then((countries) => {
				const countryMap = Object.fromEntries(
					countries.map((country) => [country.iso3166, country]),
				);
				setRawCountries(countryMap);
				setLoading(false);
			})
			.catch((cause: unknown) => {
				setError(cause instanceof Error ? cause : new Error("Failed to load countries", { cause }));
			});
	}, [setRawCountries]);

	return useMemo(() => ({ error, loading }), [error, loading]);
};
