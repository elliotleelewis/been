import { useSetAtom } from 'jotai';
import { type FC, memo, useEffect, useState } from 'react';
import { rawCountriesAtom } from '../state/atoms.ts';
import { Globe } from './globe';
import { Menu } from './menu';

export const App: FC = memo(() => {
	const setRawCountries = useSetAtom(rawCountriesAtom);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		import('../data/countries')
			.then(({ countries }) => {
				const countryMap = Object.fromEntries(
					countries.map((c) => [c.iso3166, c]),
				);
				setRawCountries(countryMap);
				setLoading(false);
			})
			.catch((e) => {
				// TODO - Error handling
				console.error(e);
			});
	}, [setRawCountries]);

	return (
		<div className="grid size-full grid-rows-[auto,1fr,auto] md:grid-cols-3 md:grid-rows-[auto,1fr] dark:bg-zinc-900 dark:text-white">
			<div className="flex items-center justify-center bg-primary p-3 text-white md:col-span-1 dark:bg-zinc-950 dark:text-primary">
				<h1 className="font-bold text-xl tracking-wide">been</h1>
			</div>
			<div className="order-3 flex flex-col overflow-auto md:order-2 md:col-span-1 md:row-start-2">
				<Menu loading={loading} />
			</div>
			<div className="order-2 min-h-[60vh] md:order-3 md:col-span-2 md:row-span-2">
				<Globe />
			</div>
		</div>
	);
});
App.displayName = 'App';
