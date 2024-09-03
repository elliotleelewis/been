import { type FC, ReactNode, useCallback, useMemo, useState } from 'react';

import { useCountries } from '../contexts/countries-context';
import { Country } from '../models/country';

interface Props {
	header: ReactNode;
}

export const Menu: FC<Props> = ({ header }) => {
	const { regions, addCountry, removeCountry } = useCountries();

	const [search, setSearch] = useState('');

	const filteredRegions = useMemo(() => {
		const s = search.trim().toLowerCase();
		if (!s) {
			return regions;
		}
		return regions
			.map((region) => ({
				...region,
				values: region.values.filter(({ name }) =>
					name.toLowerCase().includes(s),
				),
			}))
			.filter((region) => region.values.length > 0);
	}, [search, regions]);

	const toggleCountry = useCallback(
		(country: Country) => {
			if (country.selected) {
				removeCountry(country.iso3166);
			} else {
				addCountry(country.iso3166);
			}
		},
		[addCountry, removeCountry],
	);

	return (
		<>
			{header}
			<form className="border-t-2 border-zinc-200 sm:border-t-0 dark:border-zinc-700">
				<label htmlFor="search" className="sr-only">
					Search
				</label>
				<input
					id="search"
					className="w-full border-none bg-white px-4 py-2 text-zinc-900 focus:ring-2 focus:ring-inset focus:ring-primary/50 dark:bg-zinc-900 dark:text-white"
					type="text"
					placeholder="Search..."
					value={search}
					onChange={(e) => {
						setSearch(e.target.value);
					}}
				/>
			</form>
			{filteredRegions.length === 0 ? (
				<div className="m-4 h-full text-center font-medium">
					No results!
				</div>
			) : (
				<ul className="h-full overflow-y-auto">
					{filteredRegions.map((region) => (
						<li key={region.name}>
							<h2 className="bg-zinc-200 p-4 font-medium dark:bg-zinc-800">
								{region.name || 'Other'}
							</h2>
							<ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
								{region.values.map((country) => (
									<li
										key={country.iso3166}
										className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
									>
										<label className="flex items-center px-4 py-1">
											<input
												id={country.iso3166}
												className="my-0 me-2 size-4 rounded border-zinc-400 bg-zinc-50 text-primary focus:ring-2 focus:ring-primary/50 active:ring-primary dark:border-zinc-600 dark:bg-zinc-900"
												type="checkbox"
												checked={country.selected}
												onChange={() => {
													toggleCountry(country);
												}}
											/>
											<span>{country.name}</span>
										</label>
									</li>
								))}
							</ul>
						</li>
					))}
				</ul>
			)}
		</>
	);
};
