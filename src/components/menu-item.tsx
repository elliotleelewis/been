import { useSetAtom } from 'jotai';
import { type FC, memo, useCallback } from 'react';
import type { Country } from '../models/country';
import { addCountryAtom, removeCountryAtom } from '../state/atoms.ts';

interface Props {
	country: Country;
}

export const MenuItem: FC<Props> = memo(({ country }) => {
	const addCountry = useSetAtom(addCountryAtom);
	const removeCountry = useSetAtom(removeCountryAtom);

	const toggleCountry = useCallback(() => {
		if (country.selected) {
			removeCountry(country.iso3166);
		} else {
			addCountry(country.iso3166);
		}
	}, [country, addCountry, removeCountry]);

	return (
		<li className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
			<label className="flex items-center px-4 py-1">
				<input
					id={country.iso3166}
					className="my-0 me-2 size-4 rounded border-zinc-400 bg-zinc-50 text-primary focus:ring-2 focus:ring-primary/50 active:ring-primary dark:border-zinc-600 dark:bg-zinc-900"
					type="checkbox"
					checked={country.selected}
					onChange={toggleCountry}
				/>
				<span>{country.name}</span>
			</label>
		</li>
	);
});
MenuItem.displayName = 'MenuItem';
