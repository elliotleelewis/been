import {
	type FC,
	type ReactNode,
	memo,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';

import { useLocalStorage } from '../hooks/use-local-storage';
import { type Country } from '../models/country';
import { type Region } from '../models/region';
import { regionalizer } from '../utils/regionalizer';

import { CountriesContext } from './countries-context';

const COUNTRIES_STORAGE_KEY = 'APP_COUNTRIES';

interface Props {
	data: readonly Country[];
	children: ReactNode;
}

export const CountriesProvider: FC<Props> = memo(({ data, children }) => {
	const localStorage = useLocalStorage();
	const [selectedCountries, setSelectedCountries] = useState<string[]>(() => {
		const item = localStorage.getItem(COUNTRIES_STORAGE_KEY);
		return item ? (JSON.parse(item) as string[]) : [];
	});
	const [focus, setFocus] = useState<string | null>(null);

	useEffect(() => {
		localStorage.setItem(
			COUNTRIES_STORAGE_KEY,
			JSON.stringify(selectedCountries),
		);
	}, [selectedCountries, localStorage]);

	const countries = useMemo((): readonly Country[] => {
		return data.map((c) => ({
			...c,
			selected: selectedCountries.includes(c.iso3166),
		}));
	}, [data, selectedCountries]);

	const regions = useMemo((): readonly Region[] => {
		return regionalizer(countries);
	}, [countries]);

	const addCountry = useCallback((countryCode: string) => {
		setSelectedCountries((prevCountries) => {
			if (!prevCountries.includes(countryCode)) {
				setFocus(countryCode);
				return [...prevCountries, countryCode];
			}
			return prevCountries;
		});
	}, []);

	const removeCountry = useCallback((countryCode: string) => {
		setSelectedCountries((prevCountries) => {
			setFocus(null);
			const newCountries = prevCountries.filter(
				(code) => code !== countryCode,
			);
			return newCountries;
		});
	}, []);

	const clearCountries = useCallback(() => {
		setSelectedCountries([]);
	}, []);

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
