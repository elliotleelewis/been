import { type FC, memo, useEffect, useMemo, useState } from 'react';
import { CountriesProvider } from '../contexts/countries-provider';
import type { Country } from '../models/country';
import { Globe } from './globe';
import { Header } from './header';
import { Menu } from './menu';

export const App: FC = memo(() => {
	const [countries, setCountries] = useState<Record<string, Country>>({});

	const menuHeader = useMemo(() => <Header show="tablet" />, []);
	const mapHeader = useMemo(() => <Header />, []);

	useEffect(() => {
		import('../data/countries').then(({ countries }) => {
			const countryMap = Object.fromEntries(
				countries.map((c) => [c.iso3166, c]),
			);
			setCountries(countryMap);
		});
	}, []);

	return (
		<CountriesProvider data={countries}>
			<div className="flex h-full flex-col-reverse sm:flex-row">
				<div className="flex basis-1/3 flex-col overflow-auto dark:bg-zinc-900 dark:text-white">
					<Menu header={menuHeader} />
				</div>
				<div className="basis-2/3">
					<Globe header={mapHeader} />
				</div>
			</div>
		</CountriesProvider>
	);
});
App.displayName = 'App';
