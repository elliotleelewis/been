import { useCallback, useEffect, useMemo, useState } from 'react';

import data from '../data/countries.json';
import { regionalizer } from '../helpers';
import { type Country } from '../models/country';
import { type Region } from '../models/region';
import { useLocalStorage } from './useLocalStorage';

const COUNTRIES_STORAGE_KEY = 'APP_COUNTRIES';

export const useCountries = () => {
	const localStorage = useLocalStorage();

	const [selectedCountries, setSelectedCountries] = useState(() => {
		const item = localStorage.getItem(COUNTRIES_STORAGE_KEY);
		return item ? (JSON.parse(item) as string[]) : [];
	});
	const [focus, setFocus] = useState<string | null>(null);

	useEffect(() => {
		localStorage.setItem(
			COUNTRIES_STORAGE_KEY,
			JSON.stringify(selectedCountries),
		);
	}, [selectedCountries]);

	const countries = useMemo((): readonly Country[] => {
		return data.map((c) => ({
			...c,
			selected: selectedCountries.includes(c.iso3166),
		}));
	}, [selectedCountries]);

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
			const newCountries = prevCountries.filter(
				(code) => code !== countryCode,
			);
			return newCountries;
		});
	}, []);

	const clearCountries = useCallback(() => {
		setSelectedCountries([]);
	}, []);

	return {
		countries,
		regions,
		focus,
		addCountry,
		removeCountry,
		clearCountries,
	};
};
