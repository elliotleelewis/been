import {
	type FC,
	type ReactNode,
	memo,
	useCallback,
	useMemo,
	useState,
} from 'react';
import { useLocalStorage } from '../hooks/use-local-storage.ts';
import type { Country } from '../models/country.ts';
import type { Region } from '../models/region.ts';
import { regionalizer } from '../utils/regionalizer.ts';
import { CountriesContext } from './countries-context.ts';

const COUNTRIES_STORAGE_KEY = 'APP_COUNTRIES';
const COUNTRIES_STORAGE_INITIAL_VALUE = [] as const;

interface Props {
	data: Record<string, Country>;
	children: ReactNode;
}

export const CountriesProvider: FC<Props> = memo(({ data, children }) => {
	const [selectedCountries, setSelectedCountries] = useLocalStorage<
		readonly string[]
	>(COUNTRIES_STORAGE_KEY, COUNTRIES_STORAGE_INITIAL_VALUE);
	const [focus, setFocus] = useState<Country | null>(null);

	const countries = useMemo((): readonly Country[] => {
		return Object.values(data).map((c) => ({
			...c,
			selected: selectedCountries.includes(c.iso3166),
		}));
	}, [data, selectedCountries]);

	const regions = useMemo((): readonly Region[] => {
		return regionalizer(countries);
	}, [countries]);

	const addCountry = useCallback(
		(countryCode: string) => {
			setSelectedCountries((prevCountries) => {
				if (!prevCountries.includes(countryCode)) {
					setFocus(data[countryCode] ?? null);
					return [...prevCountries, countryCode];
				}
				return prevCountries;
			});
		},
		[setSelectedCountries, data],
	);

	const removeCountry = useCallback(
		(countryCode: string) => {
			setSelectedCountries((prevCountries) => {
				setFocus(null);
				const newCountries = prevCountries.filter(
					(code) => code !== countryCode,
				);
				return newCountries;
			});
		},
		[setSelectedCountries],
	);

	const clearCountries = useCallback(() => {
		setSelectedCountries([]);
	}, [setSelectedCountries]);

	const value = useMemo(
		() => ({
			countries,
			regions,
			focus,
			addCountry,
			removeCountry,
			clearCountries,
		}),
		[countries, regions, focus, addCountry, removeCountry, clearCountries],
	);

	return (
		<CountriesContext.Provider value={value}>
			{children}
		</CountriesContext.Provider>
	);
});
CountriesProvider.displayName = 'CountriesProvider';
