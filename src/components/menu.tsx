import { type FC, type ReactNode, memo, useMemo, useState } from 'react';
import { useCountries } from '../contexts/countries-context';
import { MenuItem } from './menu-item';
import { Progress } from './progress';

interface Props {
	header: ReactNode;
}

export const Menu: FC<Props> = memo(({ header }) => {
	const { regions } = useCountries();

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
							<div className="flex items-center justify-between sticky top-0 bg-zinc-200 p-4 font-medium dark:bg-zinc-800">
								<h2>{region.name || 'Other'}</h2>
								<Progress complete={region.complete ?? 0} />
							</div>
							<ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
								{region.values.map((country) => (
									<MenuItem
										key={country.iso3166}
										country={country}
									/>
								))}
							</ul>
						</li>
					))}
				</ul>
			)}
		</>
	);
});
Menu.displayName = 'Menu';
