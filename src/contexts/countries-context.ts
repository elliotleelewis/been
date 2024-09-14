import { createContext, useContext } from 'react';

import type { Country } from '../models/country';
import type { Region } from '../models/region';

export interface CountriesContextType {
	countries: readonly Country[];
	regions: readonly Region[];
	focus: Country | null;
	addCountry: (countryCode: string) => void;
	removeCountry: (countryCode: string) => void;
	clearCountries: () => void;
}

export const CountriesContext = createContext<CountriesContextType | undefined>(
	undefined,
);

export const useCountries = (): CountriesContextType => {
	const context = useContext(CountriesContext);
	if (!context) {
		throw new Error('useCountries must be used within a CountriesProvider');
	}
	return context;
};
